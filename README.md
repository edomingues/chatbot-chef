# Chatbot Chef Cook
The Chatbot Chef Cook is a simple chatbot that fetches recipes from the internet. It spells the cooking instructions step by step back to the user to be easier to prepare the meal.

## Setup Instructions

### Steps
1. Create a new agent in API.AI
1. Import the ApiAiChefExport.zip into API.AI
1. Deploy the fulfillment webhook
   1. Run `npm install` to download and install the dependencies
   1. Run `node server.js` to start the server
1. Go back to the API.AI console and select *Fulfillment* from the left navigation menu.
1. Enable *Webhook*, set the value of *URL* with the address to which the server is listening.

## Example Usage

Chatbot: Hello, what would you like to cook?     
User: tiramisu  
Chatbot: Would you like to know the recipe for Tiramisu?   
User: yes  
Chatbot: Would you like to know the ingredients before?  
User: yes  
Chatbot: \<ingredients\> Do you want to know the recipe?     
User: yes  
Chatbot: \<first instruction step\> Continue?   
User: yes  
Chatbot: \<second instruction step\> Continue?   
User: yes  
...
