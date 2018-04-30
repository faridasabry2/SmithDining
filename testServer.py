#!/usr/bin/python

from os import getenv
import pymssql
import json

conn = pymssql.connect("cbord3.smith.edu", "estephenson", "3d4vLDBoYNtq", "cbord")
cursor = conn.cursor(as_dict=True)


allergen_dict = json.load(open('allergens.json'))

# need to figure out how to get this to filter between dates
cursor.execute('''
SELECT * FROM av_srv_menu_detail
WHERE eventdate >= Convert(Date, GetDate(), 101)
AND eventdate <= Convert(Date, GetDate()+100, 101)
ORDER BY eventdate, service_unit, meal''')

menu_list = []

# iterate through every row in table
for row in cursor:
	item_id = int(row['item_intid'])
	date = str(row['eventdate'])
	meal_type = str(row['meal']).strip()
	item_name = row['formal_name'].strip()
	dining_hall = str(row['service_unit']).strip()
	course = str(row['course']).strip()
	if str(item_id) in allergen_dict:
		allergens = allergen_dict[str(item_id)]
	else:
		allergens = []

	key = date + " " + dining_hall + " " + meal_type
	
	if "parstock" not in item_name.lower():				
		row_as_dict = {
			'item_id' : item_id,
			'item_name' : item_name,
			'course' : course,
			'allergens' : allergens}


		if len(menu_list) !=0 and menu_list[-1][0] == key:
			menu_list[-1][1].append(row_as_dict)
			print("key in list, appending")
		
		else:
			menu_list.append([key, [row_as_dict]])
			print("new key")

		"""

		# menu list has items and the last item is the same as our key
		print(key in menu_list)
		if len(menu_list) !=0 and key in menu_list:
			menu_list[key].append(row_as_dict)
			print("key in dict, appending")
		
		else:
			menu_list[key] = [row_as_dict]
			print("new key")
		
		"""

# write results to menus.json file
with open("menus.json", "w") as outfile:
	json.dump(menu_list, outfile)
