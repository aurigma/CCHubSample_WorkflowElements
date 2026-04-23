# Customer's Canvas integration React sample app

This is code example illustrating how to authenticate in Customer's Canvas Hub, display an editor on a React page, and submit results to the server to start rendering process. It is based on ReactJS as a frontend framework and basic NodeJS Express-based backend. 

## Get started

### System requirements

This code was built and tested with NodeJS 20.17.0. If you run into any problems compiling this project, 
check your NodeJS version and upgrade it if necessary. 

### Configuration

Once you clone this repo, you need to configure two local files:

- Create a copy of **.env.sample**, rename it to **.env**, and add your Customer's Canvas connection details there.
- Create a copy of **code-examples.jsonc.sample**, rename it to **code-examples.jsonc**, and configure code examples there.

Both **.env** and **code-examples.jsonc** are local configuration files and should not be committed.

Environment variables are used for shared Customer's Canvas Hub integration settings and server-side credentials:

- `VITE_CCHUB_BASEURL` - depending on your instance, it is either https://customerscanvashub.com (US), https://eu.customerscanvashub.com (Europe), or https://au.customerscanvashub.com (Australia).
- `VITE_CCHUB_STOREFRONTID` - a storefront (or *integration*) record ID, created as per [Help Center > Admin's Guide > Settings > Integrations](https://customerscanvas.com/help/admin-guide/settings/integrations.html).
- `CCHUB_CLIENTID` and `CCHUB_CLIENTSECRET` - an OAuth2 Client Credentials of your app, registered in your tenant as per [Help Center > Admin's Guide > Settings > External Apps](https://customerscanvas.com/help/admin-guide/settings/external-apps.html)
- `VITE_CCHUB_TENANTID` - specify your tenant ID - see the [Help Center > Admin's Guide > Settings > Tenant](https://customerscanvas.com/help/admin-guide/settings/tenant.html).
- `VITE_CCHUB_ENVIRONMENT` - a Customer's Canvas instance location - `us`, `eu`, or `au`.

Code examples are configured in **code-examples.jsonc**. This file supports comments. Each entry contains:

- `name` and `description` - displayed on the code examples list.
- `path` - the frontend route handled by the matching React component.
- `enabled` - whether the example is returned by the backend and displayed in the app.
- `params` - code-example-specific settings, such as product IDs, design IDs, mockup IDs, or product references.

Common params are:

- `productId` - a Customer's Canvas Hub product ID for product-based Simple Editor and Handy Editor examples. Create a product as per [Help Center > Admin's Guide > PIM Module > Creating products](https://customerscanvas.com/help/admin-guide/pim/creating-products.html).
- `publicDesignId` - a public design ID. You can get it through the admin panel (Assets > Designs) as explained at https://customerscanvas.com/help/admin-guide/manage-assets/file-manager.html#information.
- `editorMockupIds` and `previewMockupIds` - arrays of mockup IDs for No PIM editor and preview visualization. You can get IDs through the admin panel (Assets > Mockups) as explained at https://customerscanvas.com/help/admin-guide/manage-assets/file-manager.html#information.
- `productReference` - a storefront product reference resolved through the UI Framework flow.

For example:

```jsonc
{
  "name": "Basic Handy Editor Sample",
  "description": "Embed Handy Editor to a page, open a product in it, and save results as a project once you finish editing.",
  "path": "/HandyEditorBasic",
  "enabled": true,
  "params": {
    "productId": 123
  }
}
```

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

This app includes a backend part in the **src/server** folder. It exposes endpoints for Customer's Canvas integration and code example configuration.

- `GET /api/code-examples`

Returns enabled code examples from **code-examples.jsonc**. The file is read by **src/server/code-example-configuration-service.ts** and filtered on the backend by the `enabled` property.

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

- In **App.tsx** routes are built from enabled code examples returned by `GET /api/code-examples`. The app keeps a registry that maps each `path` from **code-examples.jsonc** to a React component.
- The **Main** component (see the **components** folder) displays the code examples returned by the backend.
- The **code-examples** folder contains the code example components which focus on various aspects of Workflow Elements usage. For example, **code-examples/SimpleEditorBasic.tsx** contains a basic example of Simple Editor initialization.

Feel free to create copies of the code example components to experiment or make modifications directly in the pages.
