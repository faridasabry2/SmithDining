// this will hold the json of menus
let menus;

// filter options 
let searchTerm="";

let areas={};

areas["Center Campus"] = ["ZISKIND\/CUTTER","CHAPIN"];
areas["Green Street"] = ["HUBBARD", "TYLER"];
areas["Upper Elm Street"] = ["GILLETT","LAMONT"];
areas["Lower Elm Street"] = ["CHASE\/DUCKET"];
areas["West Quad"] = ["COMSTOCK\/WILDER", "MORROW\/WILSON"];
areas["East Quad"] = ["CUSHING\/EMERSON", "KING\/SCALES"];

let allergens = ["Wheat", "Eggs","Contains Nuts","Fish","Milk","Peanuts","Tree Nuts","Shellfish","Soy","Tree Nuts"];
let boxes = {};

boxes["Wheat"] = document.querySelector("input[value=wheat]");
boxes["Eggs"] = document.querySelector("input[value=eggs]");
boxes["Contains Nuts"] = document.querySelector("input[value=nuts");
boxes["Fish"] = document.querySelector("input[value=fish]");
boxes["Milk"] = document.querySelector("input[value=milk]");
boxes["Peanuts"] = document.querySelector("input[value=peanuts]");
boxes["Shellfish"] = document.querySelector("input[value=shellfish]");
boxes["Soy"] = document.querySelector("input[value=soy]");
boxes["Tree Nuts"] = document.querySelector("input[value=tree_nuts]");

let restriction = document.getElementById('diet');
let campArea = document.getElementById('area');

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

   // create div to hold items
   let main = document.querySelector("#main");

   // --------------------------------------------------------------
   // DEFAULT DATE: display the menu items for that day
   let finalGroup;
   finalGroup = filterByDate(new Date());

   updateDisplay(finalGroup);

   // --------------------------------------------------------------
   // FILTERING WILL HAPPEN HERE
   let filterBtn = document.getElementById('filter');
   let locationBtn = document.getElementById('location');
   let date = document.getElementById('datepicker');
   let sidebarBtn = document.getElementById('collapse');

   lastDate = date.value;

   filterBtn.onclick = filter;
   locationBtn.onclick = getLocation;
   sidebarBtn.onclick = collapse;

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

         updateDisplay(finalGroup);
      }
   }

   /* getting user location  */
   function getLocation() {
      if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(showPosition, showError);
      } else {
         console.log("Geolocation is not supported by this browser.");
      }
   }

   function showPosition(position) {
      console.log("Latitude: " + position.coords.latitude + 
        ", Longitude: " + position.coords.longitude);
   }

   function showError(error) {
      switch(error.code) {
         case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
            break;
         case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
            break;
         case error.TIMEOUT:
            console.log("The request to get user location timed out.");
            break;
         case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
            break;
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

   function filter(e){
      //prevent page from reloading
      e.preventDefault();


      //grab search term
      searchTerm = document.getElementById('searchTerm').value.toLowerCase();
      console.log(searchTerm);
      updateDisplay(finalGroup);
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

   //function to open/collpase sidebar of filter options
   function collapse(e){
      //prevent page from reloading
      e.preventDefault();

      let main = document.getElementById('main');
      let calendar = document.getElementById('calendar');
      let sidebarBtn = document.getElementById('sidebar');
      let className = sidebarBtn.className;

      switch(className){
          case "col-md-3 hide":
            console.log("hide");
            sidebarBtn.classList.remove("hide");
            sidebarBtn.classList.add("show");
            main.style.margin = "0px 0px";
            calendar.style.margin = "0px 0px";
            break;

          default: 
            sidebarBtn.classList.remove("show");
            sidebarBtn.classList.add("hide");
            main.style.margin = "0px 25%";
            calendar.style.margin = "0px 25%";
            break;
      }
   }

   // updates display to only include menus from finalGroup
   function updateDisplay(meals_list) {
      //clear the page
      while (main.firstChild) {
         main.removeChild(main.firstChild);
      }

      // remove the previous contents of the columns
      while (main.hasChildNodes()) {
         main.removeChild(main.lastChild);
      }

      //if no menus match, display "no results to display" message
      if (meals_list.length === 0) {
         let para = document.createElement('h5');
         para.setAttribute('class', "error")
         para.textContent = 'No results to display.';
         main.appendChild(para);
      } else {
         current = meals_list[0].dining_hall;
         group = [];
         for(let i = 0; i < meals_list.length; i++) {
            console.log(meals_list[i]);
            if(meals_list[i].dining_hall === current) {
               group.push(meals_list[i]);
            } else {
               showMeal(group);
               group = [];
               group.push(meals_list[i]);
            }

            current = meals_list[i].dining_hall;
         }
         // fixes bug where cutter/z disappeared - it was last, so its group never hit the else to show meal
         showMeal(group);
      }
   }

   /* this function displays menu items for a given 
   set of meals in a specific dining hall */
   function showMeal(menu_items) {

      // heding + meal type + columns of meals
      let section = document.createElement('section');
      section.setAttribute('class', "diningHall")

      // dining hall heading 
      let heading = document.createElement('div');
      heading.setAttribute('class', "heading")
      heading.innerHTML = menu_items[0].dining_hall;
      section.appendChild(heading);

      // columns of meals
      let breakfast = document.createElement('div');      
      let lunch = document.createElement('div');      
      let dinner = document.createElement('div');

      breakfast.classList.add('breakfast', 'col-md-4'); 
      lunch.classList.add('lunch', 'col-md-4'); 
      dinner.classList.add('dinner', 'col-md-4'); 

      // add all meals to section
      section.appendChild(breakfast);
      section.appendChild(lunch);
      section.appendChild(dinner);

      // Iterate over meals
      for (let i=0; i < menu_items.length; i++) {
         let dishes = menu_items[i];

         if(campArea.value!="All" && !areas[campArea.value].includes(dishes.dining_hall)){
            continue;
         }
 

         // list of menu items for a meal
         let items = document.createElement('ul');

         // meal heading
         let p = document.createElement('h4');
         items.appendChild(p);

         // iterate over menu items
         for (let j=0; j<dishes.items.length; j++) {
            let show=true;

            if(!dishes.items[j].item_name.toLowerCase().includes(searchTerm)){ 
               show=false;
            }

            for(index in dishes.items[j].allergens){
                let key=dishes.items[j].allergens[index];
                if(allergens.includes(key) && boxes[key].checked){
                   show=false;
                }
            }

            if(restriction.value=="Vegan" && !dishes.items[j].allergens.includes("Vegan")){
               show=false;
            }

            if(restriction.value=="Vegetarian" && !dishes.items[j].allergens.includes("Vegetarian")){
               show=false;
            }

            if(show){
               //console.log(dishes.items[j].allergens);  
               let single_item = document.createElement('li');
               single_item.innerHTML = dishes.items[j].item_name;
               items.append(single_item);
            }
         }

         if (menu_items[i].meal_type === "BREAKFAST") {
            breakfast.appendChild(items);
            breakfast.classList.add('active'); 
            p.innerHTML = "Breakfast";

         } else if (menu_items[i].meal_type === "LUNCH") {
            lunch.appendChild(items);
            lunch.classList.add('active');   
            p.innerHTML = "Lunch";  

         } else {
            dinner.appendChild(items);
            dinner.classList.add('active'); 
            p.innerHTML = "Dinner";        
         }

         // only display section if there are items in that section
         if (items.length != 0) {
            main.appendChild(section);
         }

      }
   }
}