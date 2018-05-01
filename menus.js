// this will hold the json of menus
let menus;
let allergens = ["Wheat", "Eggs","Contains Nuts","Fish","Milk","Peanuts","Tree Nuts","Shellfish","Soy","Tree Nuts"];

let searchTerm="";
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
   let filterBtn = document.querySelector('button');
   let date = document.getElementById('datepicker');
   lastDate = date.value;

   filterBtn.onclick=filter;

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

         // finalGroup = finalGroup.filter(function(entry) {
         //    return entry.course != "Parstock";
         // });

         // meals_list = []
         //    for (let i=0; i<dining_halls.length; i++) {
         //       for(let j=0; j<meals.length; j++) {
         //          group = finalGroup.filter(function(entry) {
         //             return entry.dining_hall === dining_halls[i] && entry.meal_type === meals[j];
         //          });
         //          if (group.length != 0) {
         //             meals_list.push(group);
         //          }
         //       }
         //    }
         updateDisplay(finalGroup);
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
            if(meals_list[i].dining_hall === current) {
               group.push(meals_list[i]);
            } else {
               showMeal(group);
               group = [];
               group.push(meals_list[i]);
            }

            current = meals_list[i].dining_hall;
         }
      }
   }

   /* this function displays menu items for a given meal/location/date */
   function showMeal(menu_items) {

      // row + heding 
      let section = document.createElement('section');
      section.setAttribute('class', "diningHall")

      // dining hall heading 
      let heading = document.createElement('div');
      heading.setAttribute('class', "heading")
      heading.innerHTML = menu_items[0].dining_hall;
      section.appendChild(heading);

      // columns
      let breakfast = document.createElement('div');      
      let lunch = document.createElement('div');      
      let dinner = document.createElement('div');

      breakfast.classList.add('breakfast', 'col-md-4'); 
      lunch.classList.add('lunch', 'col-md-4'); 
      dinner.classList.add('dinner', 'col-md-4'); 

      section.appendChild(breakfast);
      section.appendChild(lunch);
      section.appendChild(dinner);


      // Items
      for (let i=0; i < menu_items.length; i++) {
         let dishes = menu_items[i];

         //console.log(i);
         let col = document.createElement('div');
         col.setAttribute('class', "col-md-4");
         section.appendChild(col);

         if (menu_items[i].meal_type === "BREAKFAST") {
            col.setAttribute('class', "breakfast");
         } else if (menu_items[i].meal_type === "LUNCH") {
            col.setAttribute('class', "lunch");
         } else {
            col.setAttribute('class', "dinner");
         }

         // items
         let items = document.createElement('ul');

         // meal heading
         let p = document.createElement('h4');
         items.appendChild(p);

         // iterate over items
         for (let j=0; j<dishes.items.length; j++) {
            let show=true;
            if(!dishes.items[j].item_name.toLowerCase().includes(searchTerm)){ 
               show=false;
            }for(index in dishes.items[j].allergens){
               let key=dishes.items[j].allergens[index];
               if(allergens.includes(key) && boxes[key].checked){
                  show=false;
               }
            }if(show){
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

        
      }
      main.appendChild(section);
   }
}
