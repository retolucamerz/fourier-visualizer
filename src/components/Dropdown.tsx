import React, { useState, useEffect, useRef } from "react";

import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";

import "../styles/Dropdown.css";
import "../styles/Button.css";

type Props = {
  children: JSX.Element;
  selectorsBeloningToDropdown?: string[];
};

const Dropdown = ({ children, selectorsBeloningToDropdown = [] }: Props) => {
  const [isVisible, setIsVisible] = useState(false);

  // handle clicks outside of the menu
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!dropdownRef.current) {
        return;
      }

      const clickOnSelectors = selectorsBeloningToDropdown
        .map(s => document.querySelectorAll(s))
        .map(nodes =>
          // @ts-ignore
          [...nodes].map((node: Node) => node.contains(event.target))
        )
        .map(inNodes => inNodes.some(_ => !!_))
        .some(_ => !!_);

      const clickOutside =
        // @ts-ignore
        !dropdownRef.current.contains(event.target) &&
        // @ts-ignore
        !buttonRef.current.contains(event.target) &&
        !clickOnSelectors;

      if (clickOutside && isVisible) {
        setIsVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, selectorsBeloningToDropdown]);

  const toggle = () => setIsVisible(!isVisible);

  return (
    <div className="dropdown">
      <button
        className="dropdown-icon button button-blue"
        onClick={toggle}
        ref={buttonRef}
      >
        <ArrowDropDownIcon fontSize="large" />
        <span>Settings</span>
      </button>

      <div
        className="dropdown-content"
        style={{ display: isVisible ? "block" : "none" }}
        ref={dropdownRef}
      >
        {children}
      </div>
    </div>
  );
};
export default Dropdown;
