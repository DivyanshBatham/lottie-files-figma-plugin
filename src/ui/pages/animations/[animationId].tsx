import { useParams } from "react-router-dom";
import { useQuery, gql, TypedDocumentNode } from "@apollo/client";
import type {
  AnimationItem,
  DotLottieCommonPlayer,
} from "@dotlottie/react-player";
// import Lottie from "react-lottie";
// import "@thorvg/lottie-player";

import { DotLottie, DotLottieReact } from "@lottiefiles/dotlottie-react";

import { NetworkMessages } from "@common/network/messages";
import "@dotlottie/react-player/dist/index.css";
import { useRef, useState, useEffect } from "react";
import { ColorPicker } from "@ui/components/ColorPicker";
import classNames from "classnames";
import { formatFileSize } from "@ui/utils/file.utils";
import { Loader } from "@ui/components/Loader";
// import LottiePlayer from "@lottiefiles/lottie-player";
// require("@lottiefiles/lottie-player");

interface Result {
  id: number;
  name: string;
  imageUrl: string;
  lottieUrl: string;
  jsonUrl: string;
  lottieFileSize: number;
  downloads: number;
  createdBy: {
    id: string;
    avatarUrl: string;
    username: string;
    firstName: string;
    lastName: string;
  };
}

interface PublicLottiesData {
  publicAnimation: Result;
}

interface PublicLottiesVars {
  id: number;
}

const FETCH_PUBLIC_ANIMATION: TypedDocumentNode<
  PublicLottiesData,
  PublicLottiesVars
> = gql`
  fragment LottieDetails on PublicAnimation {
    id
    name
    imageUrl
    lottieUrl
    jsonUrl
    lottieFileSize
    downloads
    createdBy {
      id
      avatarUrl
      username
      firstName
      lastName
    }
  }

  query fetchPublicLotties($id: Int!) {
    publicAnimation(id: $id) {
      ...LottieDetails
    }
  }
`;

export default function PublicAnimation() {
  const { id } = useParams();
  // const lottieRef = useRef<DotLottieElement>() as DotLottieRefProps["lottieRef"]; // VS code kept throwing error, so had to extract it out this way.
  // const lottieRef = useRef<DotLottieCommonPlayer | null>(null); // VS code kept throwing error, so had to extract it out this way.

  const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);
  const [status, setStatus] = useState("idle");
  // const [lottie, setLottie] = useState<AnimationItem>();

  const dotLottieRefCallback = (dotLottie: any) => {
    setDotLottie(dotLottie);
  };

  useEffect(() => {
    // Event handlers
    // const onFrameChange = (event) => setCurrentFrame(event.currentFrame);
    const onPlay = () => setStatus("playing");
    const onPause = () => setStatus("paused");
    // const onStop = () => setStatus("stopped");
    // const onComplete = () => setStatus("completed");

    // Registering event listeners
    if (dotLottie) {
      // dotLottie.addEventListener("frame", onFrameChange);
      dotLottie.addEventListener("play", onPlay);
      dotLottie.addEventListener("pause", onPause);
      // dotLottie.addEventListener("stop", onStop);
      // dotLottie.addEventListener("complete", onComplete);
    }

    // Cleanup
    return () => {
      if (dotLottie) {
        // dotLottie.removeEventListener("frame", onFrameChange);
        dotLottie.removeEventListener("play", onPlay);
        dotLottie.removeEventListener("pause", onPause);
        // dotLottie.removeEventListener("stop", onStop);
        // dotLottie.removeEventListener("complete", onComplete);
      }
    };
  }, [dotLottie]);

  const playOrPause = () => {
    status === "playing" ? dotLottie?.pause() : dotLottie?.play();
  };

  const [color, setColor] = useState("#ffffffff");

  const { loading, error, data } = useQuery(FETCH_PUBLIC_ANIMATION, {
    // fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    variables: {
      id: Number(id),
    },
  });

  console.log({ loading, error, data });

  if (error) return <p>Error : {error.message}</p>;

  const renderAnimation = () => {
    if (loading) return <Loader />;
    if (error) return <Loader />;

    return (
      <div
        className={classNames({
          "bg-chequered": color.slice(-2) !== "ff",
        })}
      >
        {/* <DotLottiePlayer
      ref={lottieRef}
      src={data?.publicAnimation.lottieUrl || ""}
      onEvent={(event) => {
        console.log({ event });
        // if (event === PlayerEvents.Ready) {
        //   console.log({ ref: lottieRef.current });
        //   // console.log({ snapshot: lottieRef.current?.snapshot() });
        //   // console.log({ snapshot: lottieRef.current?.snapshot() });
        //   // setLottie(lottieRef.current?.getLottie());
        // }
      }}
      autoplay
      loop
    >
      <Controls />
    </DotLottiePlayer> */}

        <DotLottieReact
          src={data?.publicAnimation.lottieUrl}
          dotLottieRefCallback={dotLottieRefCallback}
          loop
          autoplay
        />
        {/* <LottiePlayer
    autoplay
    controls
    loop
    mode="normal"
    // src="https://assets3.lottiefiles.com/packages/lf20_UJNc2t.json"
    src={data?.publicAnimation.jsonUrl}
    style={{ width: "320px", height: "320px" }}
  ></LottiePlayer> */}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center py-3 gap-3 px-4">
        <button
          className={classNames(
            "relative inline-flex items-center rounded-md bg-white p-1 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
          )}
          onClick={() => {}}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <p className="pointer-events-none block truncate text-sm font-medium text-gray-900 text-ellipsis overflow-hidden">
          {data?.publicAnimation.name}
        </p>
        <p className="pointer-events-none block text-sm font-medium text-gray-500 text-nowrap">
          {formatFileSize(data?.publicAnimation.lottieFileSize || 0)}
        </p>
      </div>
      <div className="bg-gray-100 border flex-grow">{renderAnimation()}</div>
      <nav
        className="flex items-center justify-between border-t px-4 py-3 sticky bottom-0 bg-white z-10"
        aria-label="Pagination"
      >
        <ColorPicker
          placement={"top-right"}
          color={color}
          setColor={(color) => {
            setColor(color);
            dotLottie?.setBackgroundColor(color);
          }}
        />
        <div className="flex flex-1 justify-end">
          <button
            className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
            onClick={playOrPause}
          >
            {status == "playing" ? "Pause" : "Play"}
          </button>

          {/* <button
            className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
            onClick={() => {
              console.log(dotLottie?.snapshot());
              // console.log(lottie.snapshot());
            }}
          >
            snapshot()
          </button> */}

          <button
            className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
            onClick={() => {
              // Get the SVG content as a string
              const canvas = document.querySelector("canvas");
              const dataURL = canvas?.toDataURL();

              console.log({ dataURL });
              // const img = new Image();
              // img.src = dataURL;

              // const svgElement = document.querySelector(
              //   ".dotlottie-container svg"
              // );
              // const svgString = new XMLSerializer().serializeToString(
              //   svgElement
              // );

              // // Convert the SVG string to a Blob
              // const svgBlob = new Blob([svgString], { type: "image/svg+xml" });

              // // Create a base64 image URL using createObjectURL
              // const imageUrl = URL.createObjectURL(svgBlob);

              // // Log the URL (you can use it as an image source)
              // console.log(imageUrl);

              NetworkMessages.CREATE_SVG.send({
                // url: data?.publicAnimation?.imageUrl,
                url: dataURL,
              });
            }}
          >
            Insert as SVG
          </button>
        </div>
      </nav>
    </div>
  );
}
