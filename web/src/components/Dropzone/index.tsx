import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FiUpload    } from 'react-icons/fi'

import './style.css';

interface Props {
    onFileUploaded : (file: File) => void;
}

const Dropzone: React.FC<Props> = (props) => {
    const { onFileUploaded } = props;
    
    const [ selectedFileURL, setSelectedFileURL ] = useState<string>("");

    const onDrop = useCallback(acceptedFiles => {
        const file    = acceptedFiles[0];
        const fileURL = URL.createObjectURL(file);
        setSelectedFileURL(fileURL);
        onFileUploaded && onFileUploaded(file);
    }, [onFileUploaded])
    
    const { getRootProps, getInputProps } = useDropzone({ 
        onDrop,
        accept : 'image/*'
    });

    return (
        <div className="dropzone" { ...getRootProps() }>
            <input { ...getInputProps() } accept="image/*"/>

            { selectedFileURL 
                ? <img src={selectedFileURL} alt="Imagem do estabelecimento" />
                : (
                    <p>
                        <FiUpload />
                        Imagem do estabelecimento
                    </p>
                )
            }
            
        </div>
    )
}

export default Dropzone;