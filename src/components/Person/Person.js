import React from "react";

import { Counter, MenuButton } from "monday-ui-react-core";
import DropdownChevronDown from "monday-ui-react-core/dist/icons/DropdownChevronDown";

import PersonThumb from "components/PersonThumb/PersonThumb";
import Overlay from "components/Overlay/Overlay";

import MondayChatDataLayer from "helper/MondayChatDataLayer";
import { dateformatter } from "helper/date";

import styles from "./Person.module.css";

export default function ({
  allUsers,
  userObj,
  activeUserId,
  selectChatHandler,
  toggleMuteHandle,
}) {
  const user = MondayChatDataLayer.getPersonById(allUsers, userObj.userId);

  if (!user) {
    return <></>;
  }
  return (
    <div
      key={user.id}
      className={`${styles.person} ${
        activeUserId === user.id && styles.active
      }`}
      onClick={(e) => selectChatHandler(userObj, e)}
      tabIndex={1}>
      <PersonThumb user={user} />
      <div className={styles.usernameContainer}>
        <div className={styles.personName}>
          {userObj.type === "unread" && <strong>{user.name}</strong>}
          {userObj.type !== "unread" && <span>{user.name}</span>}
          {userObj.last_seen_at && (
            <>
              <small>{dateformatter(userObj.last_seen_at, "date")}</small>
            </>
          )}
        </div>
        <div className={styles.lastMessage}>
          {userObj.type === "unread" && (
            <>
              <strong>{userObj.last_message}</strong>
              <div style={{ display: "flex" }}>
                <Counter
                  color={Counter.colors.NEGATIVE}
                  count={1}
                  size={Counter.sizes.SMALL}
                  maxDigits={1}
                />
                {typeof toggleMuteHandle === "function" && (
                  <MenuButton
                    component={DropdownChevronDown}
                    ariaLabel={"chevron menu icon menu button"}>
                    <Overlay
                      mutedUserId={user.id}
                      muted={userObj.muted}
                      toggleMuteHandle={toggleMuteHandle}
                    />
                  </MenuButton>
                )}
              </div>
            </>
          )}
          {userObj.type !== "unread" && (
            <>
              <span>{userObj.last_message}</span>
              <MenuButton
                componentClassName={styles.menuButton}
                component={DropdownChevronDown}
                ariaLabel={"chevron menu icon menu button"}>
                <Overlay
                  mutedUserId={user.id}
                  muted={userObj.muted}
                  toggleMuteHandle={toggleMuteHandle}
                />
              </MenuButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
