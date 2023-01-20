# Assignment-10
Add a new column to roles table - permissions. It will be array of strings. Implement authorisation as a component in loopback application.
Push the code to the repo on github. Generate a PR for review.
<br>
 

Use the starter project as reference on how it can be done.
<br>
<br>
# This has the API made by looback:<br>
1 Data source: Connected to a postgres data base. 3 models: User model, customer and role.<br>
3 repositories: containing the relations between models.<br>
3 controllers: containing the CRUD functionalities of the models.<br>

Relations defined: User belongs to role and customer.<br>
Roles has many users<br>
Customers has many users<br>
<br>
# The FrontEnd made by angular:<br>
Models: Contains the interfaces of the user, customer, role model.<br>
Services: CRUD functions of the different models.<br>
dateformat.pipe: Change date format.<br>
emp-dashboard: contains the main component.<br>
customer: contains the customer UI<br>

# Things Added: <br>
