import { initializeNetwork } from "@common/network/init";
import { NetworkMessages } from "@common/network/messages";
import { NetworkSide } from "@common/network/sides";
import React from "react";
import ReactDOM from "react-dom/client";

import { MemoryRouter } from "react-router-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
} from "@apollo/client";

const client = new ApolloClient({
  // uri: "https://flyby-router-demo.herokuapp.com/",
  uri: "https://graphql.lottiefiles.com/2022-08",
  cache: new InMemoryCache(),
  // cache: new InMemoryCache({
  //   typePolicies: {
  //     Query: {
  //       fields: {
  //         feed: {
  //           // Don't cache separate results based on
  //           // any of this field's arguments.
  //           keyArgs: false,

  //           // Concatenate the incoming list items with
  //           // the existing list items.
  //           merge(existing = [], incoming) {
  //             return [...existing, ...incoming];
  //           },
  //         },
  //       },
  //     },
  //   },
  // }),
});

async function bootstrap() {
  initializeNetwork(NetworkSide.UI);

  NetworkMessages.HELLO_PLUGIN.send({ text: "Hey there, Figma!" });

  const App = (await import("./app")).default;

  const rootElement = document.getElementById("root") as HTMLElement;
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <MemoryRouter>
        <ApolloProvider client={client}>
          <App />
        </ApolloProvider>
      </MemoryRouter>
    </React.StrictMode>
  );
}

bootstrap();
