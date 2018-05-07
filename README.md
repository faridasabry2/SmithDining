# Smith Dining Menu Re-vamp

## To View ##
http://www.faridasabry.com/SmithDining/ - linked to this Github repo, but doesn't pull consistently from MSSQL menu server. Additionally, can't execute location functionality since geolocation has been deprecated for insecure origins.

https://sophia.smith.edu/~estephenson/ - not linked to this Github repo, but does consistently pull from MSSQL menu server and can execute location functionality (changes from repo are minimal - locally sourced allergen icons, not remotely sourced. Looks the same)

### Basic File Structure ###
index.html holds all sidebar and navbar elements for our site; menu items are added dynamically.

menus.js loads the menus and displays them, filtering based on the user's input.

menus.json holds all menu data.

### Known Bugs ###
Sorting by location takes a while to pull your geolocation, so doesn't execute as fast as other filtering options

Some items don't have the correct allergens listed - this is an issue with the MSSQL data.

Sometimes after filtering, meals can be shifted (i.e. dinner will show up in the breakfast column.)

Our website doesn't display on iPhones (on any browser - no idea why this is happening.)

Some of the allergen icons don't show up, such as Sesame and Gluten-free (which are not available on [Net Nutrition](http://cbweb.smith.edu/NetNutrition/1))

### For More Info ###
Our final wrote-up can be found [here](https://docs.google.com/document/d/14lF3AdbUd1L7TnIwdZQcCsjRQgcHyrWry8xkYB53y-0/edit?usp=sharing)
