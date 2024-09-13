/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import { useNavigate } from "react-router-dom";

const VideoBlock = ({ index, file }) => {
    const navigate = useNavigate()
    const { loading, result, error, fetchData } = useFetch();
    const [labels, setLabels] = useState([]);
    const [isRefetching, setIsRefetching] = useState(false);
    const [dots, setDots] = useState(0);

    useEffect(() => {
        const fetchDataFromApi = async () => {
            try {
                await fetchData(`https://storage.googleapis.com/videobucket-ai/${file}/labels.json`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        if (!loading && !isRefetching) {
            fetchDataFromApi();
        }
    }, []);

    useEffect(() => {
        if (!result) return;

        if (result.uuid != file) {
            result.status = "processing"
        }

        if ((result.status === 'processing') && !loading) {
            setIsRefetching(true);
            const timer = setTimeout(() => {
                fetchData(`https://storage.googleapis.com/videobucket-ai/${file}/labels.json`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });
                setIsRefetching(false);
                setDots(dots+1);
                

            }, 3000);

            return () => clearTimeout(timer);
        } else if (result.labels) {
            setLabels(result.labels);
        }
    }, [result]);

    const handleNavigate = () => {
        navigate(`/${file}`);
    }
    
    return (
        <div className="relative cursor-pointer" onClick={handleNavigate}>
            <div className="capitalize absolute top-2 left-2 bg-black text-white px-2 py-1 font-bold rounded">
                {result && (result.status === "completed" ? "OK" : result.status === "processing" ? ("Processing" + '.'.repeat((dots%3)+1))  : result.status)}
                {loading && <div>{"Processing" + '.'.repeat((dots%3)+1)}</div>}
            </div>
            <div className="cursor-pointer aspect-w-16 aspect-h-9 bg-black" >
                <img
                    style={{
                        objectFit: "cover",
                        placeContent: "center",
                        width: "720px",
                        height: "300px",
                    }}
                    src={`https://storage.googleapis.com/videobucket-ai/${file}/image.jpg`}
                    alt={`video-${index}`}
                />
            </div>
        </div>
    );
};

export default VideoBlock;
