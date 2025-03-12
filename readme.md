# Customer's Canvas integration React sample app

This is code example illustrating how to authenticate in Customer's Canvas Hub, display an editor on a React page, and submit results to the server to start rendering process. It is based on ReactJS as a frontend framework and basic NodeJS Express-based backend. 

## Get started

### Configuration

Once you clone this repo, you need to configure the **.env** file. To do it, create a copy based on the **.env.sample** and then add your Customer's Canvas details there. 

The environment variables are divided into two groups: common variables available on the backend only and the
variables available on the frontend (typically, specific for certain samples). The latter have the `VITE_` prefix.

Common variables are: 

- `CCHUB_BASEURL` - depending on your instance, it is either https://customerscanvashub.com (US), https://eu.customerscanvashub.com (Europe), or https://au.customerscanvashub.com (Australia).
- `CCHUB_STOREFRONTID` - a storefront (or *integration*) record ID, created as per [Help Center > Admin's Guide > Settings > Integrations](https://customerscanvas.com/help/admin-guide/settings/integrations.html).
- `CCHUB_CLIENTID` and `CCHUB_CLIENTSECRET` - an OAuth2 Client Credentials of your app, registered in your tenant as per [Help Center > Admin's Guide > Settings > External Apps](https://customerscanvas.com/help/admin-guide/settings/external-apps.html)
- `CCHUB_TENANTID` - specify your tenant ID - see the [Help Center > Admin's Guide > Settings > Tenant](https://customerscanvas.com/help/admin-guide/settings/tenant.html). 
- `VITE_CCHUB_ENVIRONMENT` - a Customer's Canvas instance location - `us`, `eu`, or `au`.

Basic samples specific variables:
- `VITE_BASICSAMPLE_CCHUB_PRODUCTID` - create a product in Customer's Canvas as per [Help Center > Admin's Guide > PIM Module > Creating products](https://customerscanvas.com/help/admin-guide/pim/creating-products.html) and set its ID here.

Samples illustrating how to load editors without PIM module:

- `VITE_NOPIMSAMPLE_CCHUB_PUBLICDESIGNID` - a public design ID. You can get it through admin panel (Assets > Designs) as explained at https://customerscanvas.com/help/admin-guide/manage-assets/file-manager.html#information 
- `VITE_NOPIMSAMPLE_CCHUB_EDITORMOCKUPID` - a comma-separated list of mockup IDs for the editor. You can get ID through admin panel (Assets > Mockups) as explained at https://customerscanvas.com/help/admin-guide/manage-assets/file-manager.html#information
- `VITE_NOPIMSAMPLE_CCHUB_PREVIEWMOCKUPID` - a comma-separated list of mockup IDs for the preview. You can get ID through admin panel (Assets > Mockups) as explained at https://customerscanvas.com/help/admin-guide/manage-assets/file-manager.html#information 

### Install and run

Run 

```
npm install
```

Then

```
npm run dev
```

The app will be opened at http://localhost:3000

## Backend

This app includes a backend part in the **src/server** folder. It exposes only two endpoints: 

- `GET /api/get-token/:userId`

As a `userId` you should send an ID of a user who starts the personalization session. For test purposes you can send something really simple like "123", but for a real-life code it should be a storefront user id (of some sort of GUID if you are working with anonymous users). You will get a token which should be passed to the editor.

- `POST /api/save-project` 

It is expected that you send the following structure as a body: 

``` json
{
    "privateDesignId": "...", // a design ID returned from the editor
    "userId": "123", // the same user ID as was set for the editor
    "orderId": "42" // an order ID you can use to "connect" a project with an order placed by the user.  
}
```
It is supposed that you call this code once the customer completes the order. 

All the integration code is implemented in **cchub-service.ts**. See comments in this file for details.

## Frontend 

The frontend app is located in the **src/client** folder. It is a React app which is organized as follows: 

- In **App.tsx** you can configure routing.
- The **Main** component (see the **components** folder) is a navigation between all code example components available in this project. It uses the `SAMPLES` structure defined in the **constants** to build this page.
- The **samples** folder contains the code example components which focus on various aspects of Workflow Elements usage. For example, **samples/SimpleEditor.tsx** contains a basic example of Simple Editor initialization. 

Feel free to create copies of the sample components to experiment or make modifications directly in the pages. 
