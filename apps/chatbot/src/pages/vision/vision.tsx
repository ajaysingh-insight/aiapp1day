import React, { useState } from "react";
import { trackPromise } from "react-promise-tracker";
import { usePromiseTracker } from "react-promise-tracker";
import { OpenAIClient, AzureKeyCredential, Completions } from '@azure/openai';

const Page = () => {

    const { promiseInProgress } = usePromiseTracker();
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imageBase64, setimageBase64] = useState<string>("");
    const [imageText, setImageText] = useState<string>();
    const [imageDesc, setImageDesc] = useState<string>("");

    async function prcess() {
        if (imageText != null) {
            trackPromise(
                visionApi(imageText, imageBase64)
            ).then((res) => {
                setImageDesc(res);
            }
            )
        }
    }

    async function visionApi(text, image): Promise<string> {
        var messages =
            [
                { "role": "system", "content": "You are a helpful assistant." },
                {
                    "role": "user", "content": [
                        {
                            "type": "text",
                            "text": text
                        },
                        {
                            "type": "image_url",
                            "imageUrl": {
                                "url": `${image}`
                            }
                        }
                    ]
                }
            ];

        const options = {
            api_version: "2024-08-01-preview"
        };

        var openai_url = "https://arg-syd-aiapp1day-openai.openai.azure.com";
        var openai_key = "e4e18d6e8fc44398b8571c9ba419bf84";
        const client = new OpenAIClient(
            openai_url,
            new AzureKeyCredential(openai_key),
            options
        );
        // ?api-version=2023-12-01-preview
        const deploymentName = 'gpt4o';
        const result = await client.getChatCompletions(deploymentName, messages, {
            maxTokens: 200,
            temperature: 0.25
        });
        return result.choices[0]?.message?.content ?? '';
    }

    function getBase64(event) {
        let file = event.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            setimageBase64(reader.result);
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    }

    const updateText = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImageText(e.target.value);
    };

    return (
        <div className="pageContainer">
            <h2>Vision</h2>

            <div>
                <input
                    type="file"
                    name="myImage"
                    onChange={(event) => {
                        setSelectedImage(event.target.files[0]);
                        getBase64(event);
                    }}
                />
                <br />

                {selectedImage && (
                    <div>
                        <h4>Your Photo</h4>
                        <p>
                            <img
                                width={"400px"}
                                src={URL.createObjectURL(selectedImage)}
                            />
                        </p>

                        <h4>Question</h4>
                        <input type="text" placeholder="(your question about the image)" onChange={updateText} />
                        <p>
                            <button onClick={() => prcess()}>Describe</button><br />
                            {
                                (promiseInProgress === true) ?
                                    <span>Loading...</span>
                                    :
                                    null
                            }
                        </p>
                        <p>
                            {imageDesc}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;