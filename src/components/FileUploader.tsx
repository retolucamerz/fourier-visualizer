import React, { useEffect, useRef, useCallback } from "react";
import PublishIcon from "@material-ui/icons/Publish";

import "../styles/FileUploader.css";

type Props = {
  onUpload: (arg0: ProgressEvent<FileReader>) => void;
  text?: string;
  style?: React.CSSProperties;
  className?: string;
};

const FileUploader = ({ onUpload, style = {}, className = "" }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImage = useCallback(
    (uploadEvent: any) => {
      var reader = new FileReader();
      reader.onload = onUpload;

      uploadEvent.target.files.length &&
        reader.readAsDataURL(uploadEvent.target.files[0]);
    },
    [onUpload]
  );

  // upload image to background
  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    inputRef.current.addEventListener("change", handleImage, false);
  }, [handleImage]);

  return (
    <div className={"file-uploader " + className}>
      <input type="file" id="fileUploader" ref={inputRef} style={style} />
      <label htmlFor="fileUploader" className="button button-blue">
        <PublishIcon fontSize="large" />
      </label>
    </div>
  );
};
export default FileUploader;
