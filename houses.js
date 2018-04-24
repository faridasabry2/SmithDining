// this will hold the json of houses
let houses;

// use fetch to retrieve it, and report any errors that occur in the fetch operation
// once the products have been successfully loaded and formatted as a JSON object
// using response.json(), run the initialize() function
fetch('menus.json').then(function(response) {
  if(response.ok) {
    response.json().then(function(json) {
      houses = json;
      initialize();
    });
  } else {
    console.log('Network request for houses.json failed with response ' + response.status + ': ' + response.statusText);
  }
});

// function sets up the initial page and deals with each input
function initialize() {

   // get the UI elements we need to manipulate
   let accessible = document.querySelector('#accessible');
   let numStudents = document.querySelector('#numStudents');
   let elevator = document.querySelector('#elevator');
   let areaDiv = document.querySelector('#area');
   // creating an array to store all checkboxes
   let areaBoxes = [];
   for(let i=0; i<areaDiv.children.length; i++) {
      if(areaDiv.children[i].nodeName === "INPUT") {
         areaBoxes.push(areaDiv.children[i]);
      }
   }
   let filterButton = document.querySelector('button');
   // create array to hold columns for results
   let c1 = document.querySelector('#one');
   let c2 = document.querySelector('#two');
   let c3 = document.querySelector('#three');
   let columns = [c1, c2, c3];
   let index = 0;

   // these contain the results of filtering by category
   // finalGroup represents the combination of the other four
   let accessibleGroup;
   let numStudentsGroup;
   let areaGroup;
   let elevatorGroup;
   let finalGroup;

   // on first load, show all houses
   finalGroup = houses;
   updateDisplay();

   // set all equal to an empty array
   accessibleGroup = [];
   numStudentsGroup = [];
   areaGroup = [];
   elevatorGroup = [];
   finalGroup = [];

   //when the search button is clicked, invoke filterResults
   filterButton.onclick = filterResults;

   // this function filters the houses based on the input buttons
   function filterResults(e) {
      // use preventDefault to stop form from submitting
      e.preventDefault();

      // set back to empty arrays to clear previous search
      accessibleGroup = [];
      numStudentsGroup = [];
      areaGroup = [];
      elevatorGroup = [];
      finalGroup = [];
      index = 0;

      // filter by accessiblity
      if (accessible.value === 'All') {
         accessibleGroup = houses;
      } else {
         // iterate over all houses and select those in the correct area of
         // campus, first case matching to json values
         let lowerCaseAccessible = accessible.value.toLowerCase();
         for(let i=0; i<houses.length; i++) {
            if (houses[i].accessible === lowerCaseAccessible) {
               accessibleGroup.push(houses[i]);
            }
         }
      }

      //filter by number of students
      if (numStudents.value === 'All') {
         numStudentsGroup = houses;
      } else {
         let lower;
         let upper;
         if(numStudents.value === '0-20') {
            lower = 0;
            upper = 20;
         } else if(numStudents.value === '20-40') {
            lower = 20;
            upper = 40;
         } else if(numStudents.value === '40-60') {
            lower = 40;
            upper = 60;
         } else if(numStudents.value === '60-80') {
            lower = 60;
            upper = 80;
         } else {
            lower = 80;
            upper = 1000;
         }
         // select all houses that fit within the capacity limit specified
         for(let i=0; i<houses.length; i++) {
            if(houses[i].capacity <= upper && houses[i].capacity > lower) {
               numStudentsGroup.push(houses[i]);
            }
         }
      }

      // filter by area
      filterCheckboxes(areaBoxes, "area", areaGroup);

      // filter by elevator
      if (elevator.value === 'All') {
         elevatorGroup = houses;
      } else {
         // iterate over all houses and select those in the correct area of
         // campus, first case matching to json values
         let lowerCaseElevator = elevator.value.toLowerCase();
         for(let i=0; i<houses.length; i++) {
            if (houses[i].elevator === lowerCaseElevator) {
               elevatorGroup.push(houses[i]);
            }
         }
      }

      mergeGroups();
      updateDisplay();

   }

   // this helper function takes in a list of checkboxes, the attribute they're
   // related to, and the group they connect to. The list of checkboxes is
   // iterated over, and boxes that are checked are filtered through the list
   // of houses.
   function filterCheckboxes(boxes, attr, group) {
      for(let i=0; i<boxes.length; i++) {
         if(boxes[i].checked === true) {
            for(let j=0; j<houses.length; j++) {
               if(houses[j][attr] === boxes[i].value) {
                  group.push(houses[j]);
               }
            }
         }
      }
   }

   // this function takes the four groups and merges them,
   // putting only houses that qualify for all four categories
   // into the final group.
   function mergeGroups() {
      for(let i=0; i<houses.length; i++) {
         let currentHouse = houses[i];
         if(areaGroup.includes(currentHouse) &&
         accessibleGroup.includes(currentHouse) &&
         numStudentsGroup.includes(currentHouse) &&
         elevatorGroup.includes(currentHouse)) {
            finalGroup.push(currentHouse);
         }
      }
   }

   // updates display to only include houses from finalGroup
   function updateDisplay() {
      // remove the previous contents of the columns
      for(let i=0; i<columns.length; i++) {
         while (columns[i].firstChild) {
            columns[i].removeChild(columns[i].firstChild);
         }
      }

      //if no houses match, display "no results to display" message
      if (finalGroup.length === 0) {
         let para = document.createElement('h5');
         para.textContent = 'No results to display.';
         columns[0].appendChild(para);
      } else {
         for(let i = 0; i < finalGroup.length; i++) {
           fetchBlob(finalGroup[i]);
         }
      }
   }

   // fetchBlob uses fetch to retrieve the image for that house, and then
   // sends the resulting image display URL and house object on to showHouse()
   // to finally display it
   function fetchBlob(house) {
     // construct the URL path to the image file from the product.image property
     let url = 'images/' + "tyler.jpg";
     // Use fetch to fetch the image, and convert the resulting response to a blob
     // Again, if any errors occur we report them in the console.
     fetch(url).then(function(response) {
       if(response.ok) {
         response.blob().then(function(blob) {
           // Convert the blob to an object URL — this is basically an temporary internal URL
           // that points to an object stored inside the browser
           objectURL = URL.createObjectURL(blob);
           // invoke showHouse
           showHouse(house);
         });
       } else {
         console.log('Network request for "' + house.name + '" image failed with response ' + response.status + ': ' + response.statusText);
       }
     });
   }

   // display a house in a sinlge column
   // includes image, house name, area of campus, year built, and capacity
   function showHouse(house) {

      // create new HTML elements that will be needed
      let section = document.createElement('section');
      let heading = document.createElement('p');
      let image = document.createElement('img');
      let area = document.createElement('p');
      let capacity = document.createElement('p');
      let year_built = document.createElement('p');

      heading.innerHTML=house.item_name;

      // give the <h4> textContent equal to the house "name" property
      // added link to floorplan here
      /*heading.innerHTML = "<a href='"+house.floor_plan+"' target='_blank' class='houseName'>"+house.name+"</a>";

      // set the src of the <img> element to the ObjectURL, set
      // the alt to the house "name" property
      image.src = objectURL;
      image.alt = house.name;

      // add contextual information about the house: area, year built, capacity
      area.className = "areaOfCampus";
      area.innerHTML = '<span class="label">area: </span>' +house.area;

      year_built.className = "year";
      year_built.innerHTML = '<span class="label">year built: </span>' +house.year_built;

      capacity.className = "cap";
      capacity.innerHTML = '<span class="label">capacity: </span>'+house.capacity;*/

      //append the elements to the DOM so the house displays
      index = (index + 1)%3
      columns[index].appendChild(section);
      section.appendChild(image);
      section.appendChild(heading);
      section.append(area);
      section.append(year_built);
      section.append(capacity);
   }
}
