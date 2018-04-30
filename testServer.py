#!/usr/bin/python

from os import getenv
import pymssql
import json

# connect to the sql server
conn = pymssql.connect("cbord3.smith.edu", "estephenson", "3d4vLDBoYNtq", "cbord")
cursor = conn.cursor(as_dict=True)

# load the json of all allergens
allergen_dict = json.load(open('allergens.json'))


# query database for: all meals within the next 100 days
# order by date, dining hall, and meal type (breakfast/lunch/dinner)
cursor.execute('''
SELECT * FROM av_srv_menu_detail
WHERE eventdate >= Convert(Date, GetDate(), 101)
AND eventdate <= Convert(Date, GetDate()+100, 101)
ORDER BY eventdate, service_unit, meal''')

menu_list = []

# iterate through every row in table
for row in cursor:
	# clean sql data
	item_id = int(row['item_intid'])
	date = str(row['eventdate'])
	meal_type = str(row['meal']).strip()
	item_name = str(row['formal_name']).strip()
	dining_hall = str(row['service_unit']).strip()
	course = str(row['course']).strip()
	# if item already has allergens listed : add new one to list
	if str(item_id) in allergen_dict:
		allergens = allergen_dict[str(item_id)]
	# else: make empty list of allergens
	else:
		allergens = []

	key = date + " " + dining_hall + " " + meal_type

	# do not include parstock listings (things like tea, condiments, cereal, etc)	
	if "parstock" not in item_name.lower():	

		# create an item row			
		row_as_dict = {
			'item_id' : item_id,
			'item_name' : item_name,
			'course' : course,
			'allergens' : allergens}

		# if the menu list is not empty and the last entry is the key:
		# add current item to list
		if len(menu_list) !=0 and menu_list[-1][0] == key:
			menu_list[-1][1].append(row_as_dict)
		
		# key not yet in list, add it
		else:
			menu_list.append([key, [row_as_dict]])

# write results to menus.json file
with open("menus.json", "w") as outfile:
	json.dump(menu_list, outfile)
