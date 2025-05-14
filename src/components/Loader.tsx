import React from "react";
import VkLogo from "../assets/vk-logo.svg";

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 animate-ping">
      <div className="mb-8">
        <img src={VkLogo} alt="vk logo" />
      </div>
      <h1 className="text-white font-bold">VK DESKTOP</h1>
    </div>
  );
};

export default Loader;
