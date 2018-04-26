// KNOWN BUGS
// Ziskind Kosher doesn't show up
// Inefficient sorting/filtering by meal/date/area


// this will hold the json of menus
let menus;
// list of dining halls
let dining_halls = ["CHAPIN", "CHASE/DUCKETT", "CUSHING/EMERSON", "CUTTER/ZISKIND", "HUBBARD", "KING/SCALES", "LAMONT", "WILSON", "NORTHROP/GILLETT", "TYLER"];
// list of all possible meals
let meals = ["BREAKFAST", "LUNCH", "DINNER"]


// use fetch to retrieve it, and report any errors that occur in the fetch operation
// once the products have been successfully loaded and formatted as a JSON object
// using response.json(), run the initialize() function
fetch('menus.json').then(function(response) {
  if(response.ok) {
    response.json().then(function(json) {
      menus = json;
      initialize();
    });
  } else {
    console.log('Network request for menus.json failed with response ' + response.status + ': ' + response.statusText);
  }
});

/* function sets up the initial page */
function initialize() {

   // create array to hold columns for results
   let c1 = document.querySelector('#one');
   let c2 = document.querySelector('#two');
   let c3 = document.querySelector('#three');
   let columns = [c1, c2, c3];
   let index = 0;

   // --------------------------------------------------------------
   // DEFAULT DATE: display the menu items for that day
   // filter out parstock items
   let finalGroup;
   finalGroup = filterByDate(new Date()).filter(function(entry) {
      return entry.course != "Parstock";
   });

   // --------------------------------------------------------------
   // SORT INTO DISPLAY GROUPS
   /* NOTE: This is probably not the most efficient way to do this, but I can't think 
      of anything better aside from infinite if statements 
      some kind of groupby statement would be ideal. I don't know if it would be possible
      to do that in the SQL formatter rather than here */

   // one possibility: one for loop with many if statements for each dining hall
   // then send that to some kind of "group" method

   // what we want - to make a group object for every day, meal, and house

   meals_list = []
   for (let i=0; i<dining_halls.length; i++) {
         for(let j=0; j<meals.length; j++) {
            group = finalGroup.filter(function(entry) {
               return entry.dining_hall === dining_halls[i] && entry.meal_type === meals[j];
            });
            if (group.length != 0) {
               meals_list.push(group);
            }
         }
      }

   // console.log(meals_list);
   
   updateDisplay(meals_list);

   // --------------------------------------------------------------
   // FILTERING WILL HAPPEN HERE
   let filterBtn = document.querySelector('button');
   let date = document.getElementById('datepicker');
   lastDate = date.value;

   // SELECT DATE 
   date.onchange = selectDate;
   
   /*
   function triggered when date is changed on calendar
   */
   function selectDate(e) {
      e.preventDefault();

      filterGroup = [];
      if(date.value === lastDate) {
         return;
      } else {
         lastDate = date.value;

         finalGroup = filterByDate(new Date(lastDate));

         finalGroup = finalGroup.filter(function(entry) {
            return entry.course != "Parstock";
         });

         meals_list = []
            for (let i=0; i<dining_halls.length; i++) {
               for(let j=0; j<meals.length; j++) {
                  group = finalGroup.filter(function(entry) {
                     return entry.dining_hall === dining_halls[i] && entry.meal_type === meals[j];
                  });
                  if (group.length != 0) {
                     meals_list.push(group);
                  }
               }
            }
         updateDisplay(meals_list);
      }
   }


   /* 
   function to filter menu items by date. 
   Can take a single date or two dates.
   If two dates are given, it will get all the menu items between those dates (inclusive).
   Returns the list of all date-correct menu items.
   */
   function filterByDate(queryDates) {
      let results;
      // user could pass a single date, or list of dates
      if (arguments.length === 1) {
         // user passed in a single date
         // filter menus on this specific date
         results = menus.filter(function (entry) {
            menuDate = new Date(entry.date);
            return menuDate.toDateString() === queryDates.toDateString();
         });
      } 
      // user passed multiple dates
      else {
         // get first and last dates
         let firstDay = arguments[0].toDateString();
         let lastDay = arguments[1].toDateString();
         // temp variables to help while loop
         let current = new Date(firstDay);
         results = [];
         // loop until current date = end date
         while (current.toDateString() >= lastDay) {
            // append that day's menu items to the list
            results.push(
               menus.filter(function (entry) {
                  menuDate = new Date(entry.date);
                  return menuDate.toDateString() === current.toDateString();
               }));
            // increment current
            current.setDate(current.getDate() + 1);
         }
      }
      return results;
   }

   // this helper function takes in a list of checkboxes, the attribute they're
   // related to, and the group they connect to. The list of checkboxes is
   // iterated over, and boxes that are checked are filtered through the list
   // of menus.
   function filterCheckboxes(boxes, attr, group) {
      for(let i=0; i<boxes.length; i++) {
         if(boxes[i].checked === true) {
            for(let j=0; j<menus.length; j++) {
               if(menus[j][attr] === boxes[i].value) {
                  group.push(menus[j]);
               }
            }
         }
      }
   }

   // this function takes the four groups and merges them,
   // putting only menus that qualify for all four categories
   // into the final group.
   function mergeGroups() {
      for(let i=0; i<menus.length; i++) {
         let currentHouse = menus[i];
         if(areaGroup.includes(currentHouse) &&
         accessibleGroup.includes(currentHouse) &&
         numStudentsGroup.includes(currentHouse) &&
         elevatorGroup.includes(currentHouse)) {
            finalGroup.push(currentHouse);
         }
      }
   }

   // updates display to only include menus from finalGroup
   function updateDisplay(meals_list) {
      console.log(meals_list);

      // remove the previous contents of the columns
      for(let i=0; i<columns.length; i++) {
         while (columns[i].firstChild) {
            columns[i].removeChild(columns[i].firstChild);
         }
      }

      //if no menus match, display "no results to display" message
      if (finalGroup.length === 0) {
         let para = document.createElement('h5');
         para.textContent = 'No results to display.';
         columns[0].appendChild(para);
      } else {
         // alert("update");
         for(let i = 0; i < meals_list.length; i++) {
            showMeal(meals_list[i]);
         }
      }
   }

   /* this function displays menu items for a given meal/location/date */
   function showMeal(menu_items) {
      // console.log(menu_items);

      let section = document.createElement('section');
      let heading = document.createElement('p');
      let meal = document.createElement('p');
      // let item = document.createElement('p');

      heading.innerHTML = menu_items[0].dining_hall;

      meal.innerHTML = '<span class="label">meal: </span>' +menu_items[0].meal_type;

      // item.innerHTML = menu_items[0].item_name;


      index = (index + 1)%3
      columns[index].appendChild(section);
      // section.appendChild(image);
      section.append(heading);
      section.append(meal);
      // section.append(item)

      // section.append(area);
      // section.append(year_built);
      // section.append(capacity);
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
      // section.appendChild(image);
      section.appendChild(heading);
      section.append(area);
      section.append(year_built);
      section.append(capacity);
   }
}
