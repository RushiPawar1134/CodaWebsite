import React from "react";
import { Routes, Route } from "react-router-dom";
import MilestoneList from "./MilestoneList";
import CreateMilestonePage from "./CreateMilestonePage";

const Milestones: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MilestoneList />} />
      <Route path="/new" element={<CreateMilestonePage />} />
    </Routes>
  );
};

export default Milestones;