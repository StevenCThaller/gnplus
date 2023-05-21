# GalNetPlus

## Initializing the Database
Manually create an empty database through something like MySQL workbench. As long as it has the same name as in your .env, you should be good to run:

`yarn migration:generate src/database/migrations/DevelopDBInit`

And then:

`yarn migration:run`

