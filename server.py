#!/usr/bin/python

from os import getenv
import pymssql
import json

# function to sort items by course
# acts as the key in a sorted() call
def key_func(key_str):
	if key_str == "Soups":
		val = 1
	if key_str == "Entrees":
		val = 2
	elif key_str == "Starches":
		val = 3
	elif key_str == "Vegetables":
		val = 4
	elif key_str == "Sauces":
		val = 5
	elif key_str == "Bread":
		val = 6
	elif key_str == "Cereals":
		val = 7
	elif key_str == "Deli":
		val = 8
	elif key_str == "Salads":
		val = 9
	elif key_str == "Salad Bar":
		val = 10
	elif key_str == "Desserts":
		val = 11
	elif key_str == "Fruits":
		val = 12
	elif key_str == "YOGURT":
		val = 13
	else:
		val = 14
	return val


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


	# do not include parstock listings (things like tea, condiments, cereal, etc)	
	if "parstock" not in item_name.lower():

		# create an item row
		item_as_dict = {
			'item_id' : item_id,
			'item_name' : item_name,
			'course' : course,
			'allergens' : allergens
		}

		# if meal/date/location combo already exists, add item to list
		if len(menu_list) != 0 and (menu_list[-1]["date"] == date and menu_list[-1]["dining_hall"] == dining_hall and menu_list[-1]["meal_type"] == meal_type):
			# add to existing items list
			menu_list[-1]["items"].append(item_as_dict)

		# otherwise, make a new row
		else:
			description = {
				'date' : date,
				'dining_hall' : dining_hall,
				'meal_type' : meal_type,
				'items' : [item_as_dict]
			}
			menu_list.append(description)


# clean up data before writing to json
for i in range(len(menu_list)):
	# create order for breakfast, lunch, dinner
	if i != 0:
		current = menu_list[i]
		prev = menu_list[i-1]
		# swap lunch and dinner
		if current['meal_type'] == 'LUNCH' and (prev['meal_type'] == 'DINNER' and prev['dining_hall'] == current['dining_hall']):
			menu_list[i-1] = current #set lunch to i-1
			menu_list[i] = prev #set dinner to i

	# sort menu items by course
	items = menu_list[i]['items']
	sorted_items = sorted(items, key=lambda item: key_func(item['course']))
	menu_list[i]['items'] = sorted_items


# write results to menus.json file
with open("menus.json", "w") as outfile:
	json.dump(menu_list, outfile)