import {useEffect, useState} from 'react';
import {Box, Container, Flex, Text, Heading, Button, Stack} from '@chakra-ui/react'

import { FilePond, registerPlugin } from 'react-filepond'
import 'filepond/dist/filepond.min.css'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import FilePondPluginFileEncode from 'filepond-plugin-file-encode';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview, FilePondPluginFileEncode)

const handleDetectObject = (encodedImage: string) => fetch(`/api/detect-object`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        encodedImage: encodedImage,
    }),
}).then((response) => response.json())
    .then((data) => data);


const DetectObject = () => {
    const [files, setFiles] = useState([]);
    const [result, setResult] = useState(null);
    const [images, setImages] = useState([])


    useEffect(() => {
        const encodedImage = files[0]?.getFileEncodeBase64String();
        if(files.length > 0 && encodedImage) {
            handleDetectObject(encodedImage).then((result) => {
                setResult(result)
            });
        }
    }, [files]);

    let imageCapture;
    const takeSnapshot = async () => {
        const canvas = document.createElement('canvas');
        canvas.getContext('2d').drawImage(document.querySelector('video'), 0, 0, canvas.width, canvas.height);
        const encodedImage = canvas.toDataURL("image/png");
        const result = await handleDetectObject(encodedImage.replace('data:image/png;base64,', ''));
        setImages([...images, {
            src: encodedImage,
            detectResult: result,
            create_date: new Date().toDateString()
        }])
    }

    const initCamera = () => {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia({ audio: false, video: { width: 1280, height: 720 } },
                function(stream) {
                    var video = document.querySelector('video');
                    video.srcObject = stream;
                    video.onloadedmetadata = function(e) {
                        video.play();
                    };

                    let mediaStreamTrack = stream.getVideoTracks()[0];
                    imageCapture = new ImageCapture(mediaStreamTrack);
                },
                function(err) {
                    console.log("The following error occurred: " + err.name);
                }
            );
        } else {
            console.log("getUserMedia not supported");
        }
    }

    return (
        <Container maxW="container.xl">
            <Flex flexWrap={"wrap"} w={"100%"}>
                <Box w="400px" m={10}>
                    <Heading as={"h1"} size={"xl"} mb={5}>Detect Image</Heading>
                    <FilePond
                        files={files}
                        onupdatefiles={fileItems => {
                            setFiles(fileItems)
                        }}
                        allowMultiple={true}
                        maxFiles={1}
                        name="files"
                        labelIdle='Drag & Drop your files or click here'
                    />

                    <Heading as={"h3"} size={"s"} mb={5}>Result</Heading>
                    {result && result?.detected_objects.map(value => {
                        return (
                            <Box borderWidth="1px" borderColor={"#ddd"} borderStyle={"solid"} overflow="hidden" p={2} mb={15} borderRadius={2}>
                                <Heading size={"l"} mt={0} mb={0}>Name: {value.name}</Heading>
                                <Text mt={1} mb={0}>Parent: {value.parent}</Text>
                            </Box>
                        )
                    })}

                </Box>
                <Box flex="1" m={10}>
                    <Heading as={"h1"} size={"xl"} mb={5}>Detect from webcam</Heading>
                    <Box w={"400px"} h={"225px"} bgColor={"black"} mb={5}>
                        <video width="400px"></video>
                    </Box>
                    <Stack direction="row">
                        <Button type={"button"} colorScheme="blue" mb={5} onClick={() => initCamera()}>Open Camera</Button>
                        <Button type={"button"} colorScheme="blue" mb={5} onClick={() => takeSnapshot()}>Take Snapshot</Button>
                    </Stack>

                    <Heading as={"h3"} size={"s"} mb={5}>Result</Heading>

                    {images.reverse().map(({src, detectResult, create_date}, index) => {
                        return (
                            <Box borderWidth="1px" borderColor={"#ddd"} borderStyle={"solid"} overflow="hidden" p={3} mb={15} borderRadius={1} key={index}>
                                <img src={src} />
                                {detectResult && detectResult?.detected_objects.map((value, index) => {
                                    return (
                                        <Box key={index} mt={2}>
                                            <Heading size={"xs"} mt={0} mb={0}>Name: {value.name}</Heading>
                                            <Text mt={1} mb={0}>Parent: {value.parent}</Text>
                                        </Box>
                                    )
                                })}
                                <Text mt={2} fontSize="sm">Creat at: {create_date}</Text>
                            </Box>
                        )
                    })}
                </Box>
            </Flex>
        </Container>
    );
}

export default DetectObject;