// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import "amazon-connect-streams";
import React, { memo, useRef, useEffect, useState } from "react";
import { CONNECT_NAME, genLogger } from "../lib";
import subscribeToContactEvents from './ccp/contactEvents.js';
import subscribeToAgentEvents from './ccp/agentEvents.js';
import axios from "axios";
// import session from "./ccp/session";

const name = "ConnectCCP";
const { log, error } = genLogger(name);
const phoneNum = ""
const ConnectCCP = (
  { phoneNum }
) => {
  const ref = useRef();

  const acceptContact = async () => {
    console.log(phoneNum.replace(/\D/g, ''));
    let filterdNum = phoneNum.replace(/\D/g, '');
    const attributes = contact.getAttributes();
    const callerID = attributes.CallerID;
    console.log(callerID);
    await axios.post(
      `https://o2xpogtamg.execute-api.us-east-1.amazonaws.com/dev/ConnectManager?destPhone=${filterdNum}&queueARN=${callerID}`);
  }

  // Disconnect the current contact
  const disconnectContact = () => {
    //cannot do contact.destroy(), can only destroy (hang-up) agent connection
    if (window.contact) {
      window.contact.getAgentConnection().destroy({
        success: function () {
          console.log("Disconnected contact via Streams");
        },
        failure: function () {
          console.log("Failed to disconnect contact via Streams");
        }
      });
    }
  }

  useEffect(() => {
    try {
      if (typeof window === "undefined") throw new Error("window missing");
      if (typeof window.connect === "undefined")
        throw new Error("global connect missing");
      log("init start");
      if (document.getElementById("ccp-div") && document.getElementById("ccp-div").innerHTML === '') {
        window.connect.core.initCCP(
          document.getElementById("ccp-div"),
          {
            ccpUrl: `https://tbi-test-connect.my.connect.aws/connect/ccp-v2`,
            region: "us-east-1",
            loginPopup: false,				// optional, defaults to `true`
            loginPopupAutoClose: false,		// optional, defaults to `false`
            loginOptions: {                 // optional, if provided opens login in new window
              autoClose: true,              // optional, defaults to `false`
              height: 600,                  // optional, defaults to 578
              width: 400,                   // optional, defaults to 433
              top: 0,                       // optional, defaults to 0
              left: 0                       // optional, defaults to 0
            },
            softphone: {                    // optional, defaults below apply if not provided
              allowFramedSoftphone: true,   // optional, defaults to false
              disableRingtone: false,       // optional, defaults to false
              // ringtoneUrl: "./ringtone.mp3" // optional, defaults to CCP’s default ringtone if a falsy value is set
            },
            pageOptions: {                  // optional
              enableAudioDeviceSettings: true, // optional, defaults to 'false'
              enablePhoneTypeSettings: true // optional, defaults to 'true'
            },
            ccpAckTimeout: 5000, //optional, defaults to 3000 (ms)
            ccpSynTimeout: 3000, //optional, defaults to 1000 (ms)
            ccpLoadTimeout: 10000 //optional, defaults to 5000 (ms)
          });
          window.connect.getLog().warn("CDEBUG >> CCP initialized");
        log("init end");
      }
    } catch (e) {
      error(e);
    }
    window.connect.core.onViewContact(
      function (event) {
        console.debug("CDEBUG >> onViewContact() - Now Vieving contact ID: '" + event.contactId + "'");
      }
    );

    // Subscribe to Contact events
    window.connect.contact(subscribeToContactEvents);
    // Subscribe to Agent events
    window.connect.agent(subscribeToAgentEvents);

    // Send information to the Connect Logger
    window.connect.getLog().info("CDEBUG >> CCP initialized and subscribed to events");
  }, []);

  log("render");
  return (
    <>
      <div
        // ref={ref}
        id="ccp-div"
        style={{ display: "none" }}
      >
      </div>
      <div className="flex justify-between mb-5">
        <div className="flex items-center gap-2" id="answerDiv" onClick={acceptContact}>
          <button
            className="p-2 rounded-full flex items-center justify-center"
          >
            <svg height="40px" width="40px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#29af63" stroke="#29af63">
              <g id="SVGRepo_bgCarrier" strokeWidth="0" />
              <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
              <g id="SVGRepo_iconCarrier"> <g> <path style={{ fill: "#29af63" }} d="M511.996,232.521c0,8.492-6.864,15.356-15.356,15.356c-8.477,0-15.356-6.864-15.356-15.356 c0-53.9-20.992-104.59-59.105-142.703s-88.804-59.105-142.703-59.105c-8.492,0-15.356-6.879-15.356-15.356 C264.119,6.864,270.983,0,279.475,0c62.1,0,120.499,24.186,164.417,68.104S511.996,170.421,511.996,232.521z" /> <path style={{ fill: "#29af63" }} d="M492.555,400.561c11.978,11.978,11.978,31.449,0,43.427l-26.09,26.09 c-5.789,5.805-13.513,8.999-21.713,8.999c-2.933,0-5.789-0.43-8.523-1.213l-5.482,5.467C411.736,502.341,385.217,512,353.399,512 c-19.41,0-40.77-3.593-63.605-10.826c-56.863-18.028-117.09-56.863-169.607-109.365C67.685,339.291,28.834,279.065,10.822,222.217 C-7.575,164.14-2.369,115.569,25.379,84.719c0.415-0.522,8.768-8.953,8.768-8.953c-2.994-10.396-0.399-22.067,7.77-30.236 l26.09-26.09c5.805-5.805,13.513-8.999,21.713-8.999s15.909,3.194,21.713,8.999l100.321,100.321 c11.978,11.978,11.978,31.464,0,43.427l-26.074,26.09c-5.989,5.989-13.851,8.983-21.729,8.983c-2.872,0-5.743-0.415-8.523-1.198 l-9.843,9.843c-7.002,7.002,3.747,50.537,56.357,103.146c52.625,52.625,96.159,63.359,103.146,56.357c0,0,0,0,0.015,0l9.843-9.843 c-2.994-10.396-0.415-22.067,7.77-30.251l26.09-26.074c11.962-11.978,31.449-11.978,43.427,0L492.555,400.561z M470.842,422.275 L370.521,321.954l-26.09,26.09l100.321,100.321C444.783,448.365,470.842,422.275,470.842,422.275z M411.798,458.853l-77.855-77.87 l-7.125,7.141h-0.015c-7.448,7.463-17.245,10.78-28.531,10.78c-33.553,0-80.312-29.407-118.042-67.136 c-50.414-50.414-85.963-116.936-56.387-146.558c0.015-0.015,0.015-0.015,0.015-0.015l7.141-7.141l-77.855-77.855l-2.764,2.764 c-22.097,22.097-25.752,61.148-10.273,109.964c16.554,52.256,52.702,108.076,101.795,157.169s104.912,85.241,157.169,101.795 c48.817,15.479,87.867,11.824,109.949-10.273c0.015,0,0.015,0,0.015,0L411.798,458.853z M163.967,167.58l26.075-26.105 L89.721,41.154l-26.09,26.09l50.168,50.153l49.784,49.8l0.369,0.369C163.967,167.58,163.967,167.58,163.967,167.58z" /> </g> <path style={{ fill: "#ffffff" }} d="M370.521,321.954l100.321,100.321c0,0-26.059,26.09-26.09,26.09L344.431,348.044L370.521,321.954z" /> <path style={{ fill: "#29af63" }} d="M434.11,232.521c0,8.477-6.88,15.356-15.356,15.356s-15.356-6.879-15.356-15.356 c0-33.092-12.884-64.219-36.302-87.621c-23.403-23.418-54.529-36.302-87.621-36.302c-8.477,0-15.356-6.879-15.356-15.356 s6.879-15.356,15.356-15.356c41.308,0,80.128,16.078,109.35,45.3C418.032,152.393,434.11,191.213,434.11,232.521z" /> <path style={{ fill: "#29af63" }} d="M333.943,380.983l77.855,77.87l-2.764,2.764c0,0,0,0-0.015,0 c-22.082,22.097-61.132,25.752-109.949,10.273c-52.256-16.554-108.076-52.702-157.169-101.795S56.66,265.183,40.106,212.926 c-15.479-48.817-11.824-87.867,10.273-109.964l2.764-2.764l77.855,77.855l-7.141,7.141c0,0,0,0-0.015,0.015 c-29.576,29.622,5.973,96.144,56.387,146.558c37.73,37.73,84.489,67.136,118.042,67.136c11.287,0,21.084-3.317,28.531-10.78h0.015 L333.943,380.983z" /> <path style={{ fill: "#29af63" }} d="M356.225,232.521c-0.015,8.477-6.879,15.356-15.356,15.356h-0.015 c-8.477,0-15.356-6.879-15.341-15.356c0-12.469-4.668-23.725-13.483-32.555c-8.953-8.937-19.901-13.483-32.539-13.483h-0.015 c-8.477,0.015-15.356-6.864-15.356-15.341c0-8.492,6.879-15.356,15.356-15.371h0.015c20.792,0,39.542,7.785,54.253,22.481 C348.454,192.964,356.225,211.729,356.225,232.521z" /> <path style={{ fill: "#ffffff" }} d="M190.042,141.475l-26.074,26.105c0,0,0,0-0.015-0.015l-0.369-0.369l-49.784-49.8L63.631,67.244 l26.09-26.09L190.042,141.475z" /> </g>
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2" id="hangupDiv" onClick={disconnectContact}>
          <button
            className="p-2 rounded-full flex items-center justify-center"
          >
            <svg fill="#f53c2d" height="40px" width="40px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 511.639 511.639" transform="rotate(-45)matrix(-1, 0, 0, -1, 0, 0)">
              <g id="SVGRepo_bgCarrier" strokeWidth="0" />
              <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
              <g id="SVGRepo_iconCarrier"> <g> <g> <path d="M504.982,376.258h-0.021c-19.435-36.715-81.472-73.813-88.725-78.059c-14.4-8.213-29.696-10.731-42.987-6.997 c-10.411,2.88-18.944,9.301-24.768,18.624c-8.107,9.664-18.155,21.035-20.309,22.933c-16.512,11.221-26.944,10.133-41.28-4.224 L183.083,224.748c-14.336-14.357-15.403-24.768-4.757-40.533c2.411-2.859,13.824-12.949,23.488-21.056 c9.323-5.824,15.723-14.357,18.624-24.768c3.691-13.333,1.195-28.587-7.125-43.221c-4.117-7.019-41.216-69.077-77.952-88.512 C113.153-5.076,86.315-1.044,68.566,16.727L45.633,39.639C4.203,81.068-46.229,169.644,81.43,297.324L214.315,430.21 c61.141,61.141,113.301,81.429,155.627,81.429c46.059,0,80.448-24.043,102.037-45.632l22.912-22.912 C512.662,425.324,516.715,398.466,504.982,376.258z" /> </g> </g> </g>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default memo(ConnectCCP);
