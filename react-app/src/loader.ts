import App from "./App.tsx";
import AppView from "./appview/AppView.tsx";

const widget = {
  id: "REACT_WIDGET", // must be globally unique
  framework: "react",
  component: App,
  title: "My React Widget",
  emittingChannels: ["REACT_WIDGET"],
  receivingChannels: ["ANGULAR_WIDGET"],
  width: 600,
  height: 400,
};

const app = {
  id: "REACT_APP", // must be globally unique
  framework: "react",
  component: AppView,
  routeName: "react-app",
  appView: true,
  title: "React App",
};

export { widget, app };
