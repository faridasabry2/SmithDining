# Smith Dining Menu Re-vamp

## To View ##
http://www.faridasabry.com/SmithDining/ - linked to this Github repo, but doesn't pull consistently from MSSQL menu server

https://sophia.smith.edu/~estephenson/ - not linked to this Github repo, but does consistently pull from MSSQL menu server (changes from repo are minimal - locally sourced allergen icons, not remotely sourced. Looks the same)

### Basic File Structure ###
index.html holds all sidebar and navbar elements for our site; menu items are added dynamically.

menus.js loads the menus and displays them, filtering based on the user's input.

menus.json holds all menu data.

### Known Bugs ###
Filtering by location does not work. (Takes a long time for the function to execute, and splits dining halls).

Some items don't have the correct allergens listed - this is an issue with the MSSQL data.

Sometimes after filtering, meals can be shifted (i.e. dinner will show up in the breakfast column.)

Our website doesn't display on iPhones (on any browser - no idea why this is happening.)
