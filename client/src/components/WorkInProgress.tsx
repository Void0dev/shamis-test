import sorryGif from '/assets/sorry.gif';

export const WorkInProgress = () => {
  return (
    <div className="absolute w-full flex justify-center items-center flex-col mt-10">
      <img src={sorryGif} alt="sorry gif" style={{display: "block", width: "300px"}}/>
      <p className="text-xl">Sorry, technical maintenance!</p>
    </div>
  );
};