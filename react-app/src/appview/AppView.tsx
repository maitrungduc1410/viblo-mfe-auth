import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import Main from "./Main";
import Foo from "./Foo";
import Bar from "./Bar";

const AppView = () => {
  return (
    <BrowserRouter basename="/main/react-app">
      <Routes>
        <Route element={<Main />}>
          <Route path="/foo" element={<Foo />} />
          <Route path="/bar" element={<Bar />} />
        </Route>
        <Route path="/" element={<Navigate replace to="/foo" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppView;
