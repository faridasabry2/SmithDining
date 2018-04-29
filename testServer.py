from os import getenv
import pymssql
import json

conn = pymssql.connect("cbord3.smith.edu", "estephenson", "3d4vLDBoYNtq", "cbord")
cursor = conn.cursor(as_dict=True)

# get allergen information
cursor.execute("SELECT * FROM av_item_traits WHERE trait_category IN ('Dietary', 'Allergen', 'General')")

allergen_dict = {}

for row in cursor:
	item_id = int(row['item_intid'])
	if item_id in allergen_dict:
		allergen_dict[item_id].append(row['trait_name'].strip())
	else:
		allergen_dict[item_id] = [row['trait_name'].strip()]



# need to figure out how to get this to filter between dates
cursor.execute('SELECT * FROM av_srv_menu_detail WHERE eventdate >= Convert(Date, GetDate(), 101) AND eventdate <= Convert(Date, GetDate()+100, 101) ORDER BY eventdate, service_unit, CASE meal WHEN "BREAKFAST" then 1 WHEN "LUNCH" then 2 when "DINNER" then 3 ELSE 4 END')

menu_list = []

for row in cursor:
	item_id = int(row['item_intid'])
	date = str(row['eventdate'])
	meal_type = row['meal'].strip()
	item_name = row['formal_name'].strip()
	dining_hall = row['service_unit'].strip()
	course = str(row['course']).strip()
	if item_id in allergen_dict:
		allergens = allergen_dict[item_id]
	else:
		allergens = []

	row_as_dict = {
		'item_id' : item_id,
		'meal_type' : meal_type,
		'item_name' : item_name,
		'dining_hall' : dining_hall,
		'course' : course,
		'date' : date,
		'allergens' : allergens}

	menu_list.append(row_as_dict)	

print(json.dumps(menu_list))
