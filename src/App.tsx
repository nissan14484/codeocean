import { UsersPage } from "./pages/users/UsersPage";
import "./App.css";
import {ReviewersPage} from "./pages/reviewers/ReviewersPage";
import {useEffect, useState} from "react";

export const columns = [
  { title: "First Name", dataIndex: "firstName", key: "firstName" },
  { title: "Last Name", dataIndex: "lastName", key: "lastName" },
  { title: "Email", dataIndex: "email", key: "email" },
  { title: "Catch Phrase", dataIndex: "catchPhrase", key: "catchPhrase" },
  { title: "Comments", dataIndex: "comments", key: "comments" },
];

export default function App() {
  const [tableWidth, setTableWidth] = useState(window.innerWidth / 2 - 48);
  const [tableHeight, setTableHeight] = useState(window.innerHeight);

  useEffect(() => {
    const onResize = () => {
      setTableHeight(window.innerHeight);
      setTableWidth(window.innerWidth);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return <div className="tables-container">
    <UsersPage tableWidth={tableWidth} tableHeight={tableHeight} />
    <ReviewersPage tableWidth={tableWidth} tableHeight={tableHeight} />
  </div>;
}
