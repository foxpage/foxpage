import React from 'react';

const ImageCard = ({
  screenshot,
  title,
  isDetail,
}: {
  screenshot?: string; // image url
  title: React.ReactNode; // title
  isDetail: boolean;
}) => {
  return (
    <div className="relative">
      {!isDetail ? (
        <div
          className="flex justify-center rounded items-center h-24 bg-contain bg-center bg-no-repeat bg-gray-300"
          style={{
            backgroundImage: `linear-gradient(to bottom, transparent, #8f8f8f)${
              screenshot ? `, url(${screenshot}` : ''
            }`,
          }}></div>
      ) : (
        <>{screenshot && <img className="w-full h-full" src={screenshot} />}</>
      )}
      <div
        className={`font-medium p-2 z-10 break-all flex justify-center items-end${
          !isDetail ? ' absolute top-0 bottom-0 right-0 left-0 text-white ' : ''
        }`}>
        {title}
      </div>
    </div>
  );
};

export default ImageCard;
