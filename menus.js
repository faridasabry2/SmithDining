// this will hold the json of menus
let menus;
let finalGroup;

// holds current user's location
let long = 0;
let lat = 0;
let showLocation = document.getElementById('showLocation');
let coords = {};

coords["CHAPIN"] = [42.318886, -72.639308];
coords["CHASE\/DUCKETT"] = [42.319581, -72.636298];
coords["COMSTOCK\/WILDER"] = [42.319999, -72.644916];
coords["CUSHING\/EMERSON"] = [42.319990, -72.643611];
coords["GILLETT"] = [42.319766, -72.636856];
coords["HUBBARD"] = [42.317140, -72.637079];
coords["KING\/SCALES"] = [42.321213, -72.642810];
coords["LAMONT"] = [42.320354, -72.636352];
coords["MORROW\/WILSON"] =[42.320801, -72.644684];
coords["TYLER"] = [42.316740, -72.639728];
coords["ZISKIND\/CUTTER"] = [42.320700, -72.638250];
coords["ZISKIND KOSHER"] = [42.320700, -72.638250];


// filter options 
let searchTerm="";

// object of areas of campus for filtering
let areas={};

areas["Center Campus"] = ["ZISKIND\/CUTTER", "ZISKIND KOSHER", "CHAPIN"];
areas["Green Street"] = ["HUBBARD", "TYLER"];
areas["Upper Elm Street"] = ["GILLETT","LAMONT"];
areas["Lower Elm Street"] = ["CHASE\/DUCKETT"];
areas["West Quad"] = ["COMSTOCK\/WILDER", "MORROW\/WILSON"];
areas["East Quad"] = ["CUSHING\/EMERSON", "KING\/SCALES"];

// objects for filtering by allergens (checkboxes)
let allergens = ["Wheat", "Eggs","Contains Nuts","Fish","Milk","Peanuts","Tree Nuts","Shellfish","Soy","Tree Nuts", "Corn", "Sesame"];
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
boxes["Corn"] = document.querySelector("input[value=corn]");
boxes["Sesame"] = document.querySelector("input[value=sesame]");

// object for displaying allergen icons on hover
let allergen_icons = {};
allergen_icons["Wheat"] = "http://cbweb.smith.edu/NetNutrition/Images/traits/Gluten.jpg";
allergen_icons["Eggs"] = "http://cbweb.smith.edu/NetNutrition/Images/traits/Eggs.jpg";
allergen_icons["Contains Nuts"] = "http://cbweb.smith.edu/NetNutrition/Images/traits/Peanuts.jpg";
allergen_icons["Fish"] = "http://cbweb.smith.edu/NetNutrition/Images/traits/Fish.jpg";
allergen_icons["Milk"] = "http://cbweb.smith.edu/NetNutrition/Images/traits/Dairy.jpg";
allergen_icons["Peanuts"] = "http://cbweb.smith.edu/NetNutrition/Images/traits/Peanuts.jpg";
allergen_icons["Tree Nuts"] = "http://cbweb.smith.edu/NetNutrition/Images/traits/Treenuts.jpg";
allergen_icons["Shellfish"] = "http://cbweb.smith.edu/NetNutrition/Images/traits/Shellfish.jpg";
allergen_icons["Soy"] = "http://cbweb.smith.edu/NetNutrition/Images/traits/Soy.jpg";
allergen_icons["Corn"] = "http://cbweb.smith.edu/NetNutrition/Images/traits/Corn.jpg"
allergen_icons["Sesame"] = "http://cbweb.smith.edu/NetNutrition/Images/traits/Sesame.jpg"
allergen_icons["Vegetarian"] = "http://cbweb.smith.edu/NetNutrition/Images/traits/Vegetarian.jpg";
allergen_icons["Vegan"] = "http://cbweb.smith.edu/NetNutrition/Images/traits/Vegan.jpg";

// object of dining hall latitude/longitude for sorting by location
let dining_coords = {};
dining_coords["CHAPIN"] = [42.319082, -72.639259];
dining_coords["ZISKIND\/CUTTER"] = [42.320616, -72.638274];
dining_coords["HUBBARD"] = [42.317177, -72.636951];
dining_coords["TYLER"] = [42.316652, -72.639660];
dining_coords["GILLETT"] = [42.319801, -72.636877];
dining_coords["LAMONT"] = [42.320444, -72.635781];
dining_coords["CHASE\/DUCKETT"] = [42.319407, -72.636367];
dining_coords["COMSTOCK\/WILDER"] = [42.320034, -72.644433];
dining_coords["MORROW\/WILSON"] = [42.320919, -72.644303];
dining_coords["CUSHING\/EMERSON"] = [42.320131, -72.643467];
dining_coords["KING\/SCALES"] = [42.321152, -72.642898];


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
   finalGroup = filterByDate(new Date());

   updateDisplay(finalGroup);

   // --------------------------------------------------------------
   // FILTERING WILL HAPPEN HERE
   let filterBtn = document.getElementById('filter');
   let locationBtn = document.getElementById('location');
   let date = document.getElementById('datepicker');
   let sidebarBtn = document.getElementById('collapse');

   // define buttons
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
      showLocation.innerHTML = "Getting Your Location...";
      loc = navigator.geolocation
      if (loc) {
         loc.getCurrentPosition(showPosition, showError, {
            timeout: 5000,
            maximumAge: 0,
            enableHighAccuracy: true
         });
      }
   }

   /* function to do something with user location 
   ideally: go through every dining hall, calculate distance, 
   sort final group by distance  */ 
   function showPosition(position) {
      lat = position.coords.latitude;
      long = position.coords.longitude;
      sortByLocation();
      updateDisplay(finalGroup);
   }

   // error function for geolocation (most likely user rejected permissions)
   function showError(error) {
      switch(error.code) {
         case error.PERMISSION_DENIED:
            showLocation.innerHTML = "User denied the request for Geolocation.";
            break;
         case error.POSITION_UNAVAILABLE:
            showLocation.innerHTML = "Location information is unavailable.";
            break;
         case error.TIMEOUT:
            showLocation.innerHTML = "The request to get user location timed out.";
            break;
         case error.UNKNOWN_ERROR:
            showLocation.innerHTML = "An unknown error occurred.";
            break;
      }
   }

   function toRadians(degrees)
   {
     var pi = Math.PI;
     return degrees * (pi/180);
   }

   function sortByLocation() {
      showLocation.innerHTML =  "Latitude: " + Math.round(lat * 100) / 100 + ", Longitude: " + Math.round(long * 100) / 100;

      distances = {};

      finalGroup.forEach(function(item) {
         if(item.diningHall !== "-SPECIAL DAYS" && coords[item.dining_hall] != undefined) {
            lat2 = coords[item.dining_hall][0];
            long2 = coords[item.dining_hall][1];

            // calculates distance in meters between two geolocations
            // algorithm taken from https://www.movable-type.co.uk/scripts/latlong.html
            var R = 6371e3; // meters
            var latR = toRadians(lat);
            var lat2R = toRadians(lat2);
            var dLat = toRadians((lat2-lat));
            var dLong = toRadians((long2-long));

            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(latR) * Math.cos(lat2R) *
                    Math.sin(dLong/2) * Math.sin(dLong/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

            var d = R * c;

            // console.log(item.dining_hall + " is: " + d + " meters away");

            distances[item.dining_hall] = d;
         }
      });

      finalGroup = mapOrder(finalGroup, distances, 'dining_hall');
      updateDisplay(finalGroup);
   }

   /**
    * Sort array of objects based on another array
    */
   function mapOrder (array, distances, key) {
     
      array.sort( function (a, b) {
         let A = a[key]; 
         let B = b[key];
       
         if (distances[A] > distances[B]) {
            return 1;
         } else {
            return -1;
         }
       
      });
     return array;
   };

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

   /* function is triggered when user hits the filter button */
   function filter(e){
      //prevent page from reloading
      e.preventDefault();

      //grab search term
      searchTerm = document.getElementById('searchTerm').value.toLowerCase();
      updateDisplay(finalGroup);
   }

   //function to open/collpase sidebar of filter options
   function collapse(e){
      //prevent page from reloading
      e.preventDefault();

      let main = document.getElementById('main');
      let calendar = document.getElementById('calendar');
      let sidebarBtn = document.getElementById('sidebar');
      let location = document.getElementById('location');
      let gps = document.getElementById('showLocation');
      let className = sidebarBtn.className;

      switch(className){
          case "col-md-3 hide":
            // console.log("hide");
            sidebarBtn.classList.remove("hide");
            sidebarBtn.classList.add("show");
            main.style.margin = "0px 0px";
            calendar.style.margin = "0px 0px";
            showLocation.style.margin = "10px 0px 0px 0%";
            location.style.margin = "10px 5px 0px 0%";
            break;

          default: 
            sidebarBtn.classList.remove("show");
            sidebarBtn.classList.add("hide");
            main.style.margin = "0px 30%";
            calendar.style.margin = "0px 30%";
            showLocation.style.margin = "10px 0px 0px 30%";
            location.style.margin = "10px 5px 0px 30%";
            break;
      }
   }

   // updates display to only include menus from finalGroup and ignore filtered items
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

            if(meals_list[i].dining_hall === current) {
               //if this menu is also for the same dining hall, add it to group
               group.push(meals_list[i]);
            } else {
               //if its for a new dining hall, show the previous group if applicable and start a new group
               if(campArea.value=="All" || areas[campArea.value].includes(current)) showMeal(group);
               group = [];
               group.push(meals_list[i]);
            }

            current = meals_list[i].dining_hall;
         }
         // fixes bug where cutter/z disappeared - it was last, so its group never hit the else to show meal
         if(campArea.value=="All" || areas[campArea.value].includes(current)) showMeal(group);
      }

      // if no results are displayed - put up a no results message
      // loop through all children of main: if all are empty, show empty message
      // have to do this twice because dynamic filtering is happening in showMeal
      let emptyResult = true;
      for (let i=0; i<main.childNodes.length; i++) {
         if (main.childNodes[i].hasChildNodes()) {
            emptyResult = false;
         }
      }
      if (emptyResult) {
         let empty = document.createElement('h5');
         empty.setAttribute('class', 'error');
         empty.innerHTML = "No results to display.";
         main.append(empty);
      }
   }

   /* this function displays menu items for a given 
   set of meals in a specific dining hall.
   Also filters based on user specifications. */
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
      let empty=true;

      // Iterate over meals
      for (let i=0; i < menu_items.length; i++) {
         let dishes = menu_items[i];
 

         // list of menu items for a meal
         let items = document.createElement('ul');

         // meal heading
         let p = document.createElement('h4');
         items.appendChild(p);

         // iterate over individual menu items
         for (let j=0; j<dishes.items.length; j++) {
            let show=true;

            //dont show any given item that the user has excluded with their filtering
            //search
            if(!dishes.items[j].item_name.toLowerCase().includes(searchTerm)){ 
               show=false;
            }

            //filter by allergens
            for(index in dishes.items[j].allergens){
                let key=dishes.items[j].allergens[index];
                if(allergens.includes(key) && boxes[key].checked){
                   show=false;
                }
            }

            // filter by vegan
            if(restriction.value=="Vegan" && !dishes.items[j].allergens.includes("Vegan")){
               show=false;
            }

            //filter by vegetarian (also showing vegan items)
            if(restriction.value=="Vegetarian" && !dishes.items[j].allergens.includes("Vegetarian") && !dishes.items[j].allergens.includes("Vegan")){
               show=false;
            }

            //if item is valid, append it to items list
            if(show){
               let single_item = document.createElement('li');
               single_item.innerHTML = dishes.items[j].item_name;
               items.append(single_item);

               // adding the allergens icons for a single item
               let allergens_list = document.createElement('ul');
               allergens_list.classList.add('hide_icons');

               // iterate through all allergens and add an image for it
               // by default, do not display images (only show on hover)
               for (allergen in dishes.items[j].allergens) {
                  single_allergen = document.createElement('img');
                  single_allergen.src = allergen_icons[dishes.items[j].allergens[allergen]];
                  single_allergen.alt = dishes.items[j].allergens[allergen];
                  single_allergen.classList.add("allergenIcon");
                  allergens_list.appendChild(single_allergen);

               }
               single_item.appendChild(allergens_list);
            }
         }

         // add classes for meal types
         if (menu_items[i].meal_type === "BREAKFAST") {
               breakfast.appendChild(items);
               breakfast.classList.add('active'); 
               if(items.childElementCount>1) {
                  p.innerHTML = "Breakfast";
                  emtpy=false;
               }

         } else if (menu_items[i].meal_type === "LUNCH") {
            lunch.appendChild(items);
            lunch.classList.add('active');   
            if(items.childElementCount>1) {
               p.innerHTML = "Lunch";
               empty=false;
            }  

         } else {
            dinner.appendChild(items);
            dinner.classList.add('active'); 
            if(items.childElementCount>1) {
               p.innerHTML = "Dinner"; 
               empty=false;
            }
         }

      }

      // only append the section to the page if there are items in it
      // (this fixes an earlier bug where headers displayed with no items underneath)
      if(!empty) main.appendChild(section);
   }      
}


// on hover - remove hidden class for icons
$(document).on("mouseenter", "li", function() {
    // hover starts code here
    this.childNodes[1].classList.remove('hide_icons');
});

// on mouseout - add hidden class for icons
$(document).on("mouseout", "li", function() {
    // hover starts code here
    this.childNodes[1].classList.add('hide_icons');
});

