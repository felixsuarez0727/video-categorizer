import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';

const Video = () => {
    const { videoUuid } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);

    const [labels, setLabels] = useState([]);
    const [selectedSegments, setSelectedSegments] = useState([]);
    const [isRefetching, setIsRefetching] = useState(false);
    const [dots, setDots] = useState(0);

    const handleGoBack = () => {
        navigate(-1);
    };

    const playSegments = () => {
        console.log(selectedSegments);

        if (videoRef.current && selectedSegments.length > 0) {
            let currentSegment = 0;

            const playNextSegment = () => {
                if (currentSegment >= selectedSegments.length) return;

                const { start, end } = selectedSegments[currentSegment];
                videoRef.current.currentTime = start;
                videoRef.current.play();

                const stopAtTime = () => {
                    if (videoRef.current.currentTime >= end) {
                        videoRef.current.pause();
                        videoRef.current.removeEventListener('timeupdate', stopAtTime);
                        currentSegment++;
                        setTimeout(playNextSegment, 1); // Short delay before playing the next segment
                    }
                };

                videoRef.current.addEventListener('timeupdate', stopAtTime);
            };

            playNextSegment();
        }
    };

    const handleCheckboxChange = (segment) => {
        setSelectedSegments((prevSelected) => {
            const segmentIndex = prevSelected.findIndex(
                (item) => item.start === segment.start && item.end === segment.end
            );

            if (segmentIndex > -1) {
                // Segment is already selected, remove it
                return prevSelected.filter((_, index) => index !== segmentIndex);
            } else {
                // Segment is not selected, add it
                return [...prevSelected, segment];
            }
        });
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    // List of cool colors
    const coolColors = [
        '#ADD8E6', // Light Blue
        '#87CEEB', // Sky Blue
        '#4682B4', // Steel Blue
        '#4169E1', // Royal Blue
        '#00BFFF', // Deep Sky Blue
        '#1E90FF', // Dodger Blue
        '#B0E0E6', // Powder Blue
        '#5F9EA0'  // Cadet Blue
    ];

    const getColorForIndex = (index) => {
        return coolColors[index % coolColors.length];
    };

    const { loading, result, fetchData } = useFetch();

    useEffect(() => {
        const fetchDataFromApi = async () => {
            try {
                await fetchData(`https://storage.googleapis.com/videobucket-ai/${videoUuid}/labels.json`, {
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

        if (result.uuid !== videoUuid) {
            result.status = "processing";
        }

        if (result.status === 'processing' && !loading) {
            setIsRefetching(true);
            const timer = setTimeout(() => {
                fetchData(`https://storage.googleapis.com/videobucket-ai/${videoUuid}/labels.json`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });
                setIsRefetching(false);
                setDots(dots + 1);
            }, 3000);

            return () => clearTimeout(timer);
        } else if (result.labels) {
            const groupedLabels = new Map();

            Object.keys(result.labels).forEach(label => {
                const segments = result.labels[label];
                segments.forEach(segment => {
                    const key = `${segment.start_time}-${segment.end_time}`;
                    if (!groupedLabels.has(key)) {
                        groupedLabels.set(key, { start: segment.start_time, end: segment.end_time, labels: [] });
                    }
                    groupedLabels.get(key).labels.push(label);
                });
            });

            // Convert Map to array and sort by start time
            const newLabels = Array.from(groupedLabels.values())
                .sort((a, b) => a.start - b.start)
                .map((item, index) => ({
                    start: item.start,
                    end: item.end,
                    labels: item.labels.join(', '),
                    color: getColorForIndex(index) // Assign a color from the palette
                }));

            setLabels(newLabels);
        }
    }, [result, videoUuid, loading, isRefetching, dots]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            {/* Back button */}
            <button
                onClick={handleGoBack}
                className="self-start bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
            >
                Go Back
            </button>

            {/* Video container */}
            <div className="relative w-full max-w-3xl mb-4">
                <video
                    ref={videoRef}
                    className="w-full rounded-lg shadow-lg"
                >
                    <source src={`https://storage.googleapis.com/videobucket-ai/${videoUuid}/video.mp4`} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            {/* Button to play selected segments */}
            <button
                onClick={playSegments}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
            >
                Play Selected Segments
            </button>

            {/* Checkboxes for selecting segments in grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-4xl capitalize">
                {labels.map((label, index) => (
                    <div
                        key={index}
                        className="flex items-center p-2 rounded-lg"
                        style={{ backgroundColor: label.color }} // Apply predefined background color
                    >
                        <input
                            type="checkbox"
                            id={`segment-${index}`}
                            onChange={() => handleCheckboxChange({ start: label.start, end: label.end })}
                            className="mr-2"
                            checked={selectedSegments.some(
                                (item) => item.start === label.start && item.end === label.end
                            )}
                        />
                        <label htmlFor={`segment-${index}`} className="text-sm">
                            {`Segment ${index + 1}: ${formatTime(label.start)} - ${formatTime(label.end)} (${label.labels})`}
                        </label>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default Video;
