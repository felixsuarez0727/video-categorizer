/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import { fullUrl } from "../utils/constants";

const Filterer = ({filterFiles, setFilterFiles, filterValue, setFilterValue, reloads}) => {
    const { loading, result, error, fetchData } = useFetch("");
    const [labels, setLabels] = useState([]);
    const [clickedLabel, setClickedLabel] = useState(false);

    useEffect(() => {
        const fetchDataFromApi = async () => {
            try {
                await fetchData(`${fullUrl}/v1/bucket/labels`, {
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

        if (!loading) {
            fetchDataFromApi();
        }
    }, [reloads]);

    useEffect(() => {
        if (!result || !result.data) return;
        setLabels(result.data);
    }, [result]);

    const addedUuids = new Set();
    const handleFilterChange = (event) => {
        setFilterValue(event.target.value);
        setClickedLabel(false);

        const filteredUuids = labels.filter(label => {

            const labelUuid = label.video_uuid;
            const labelLower = label.label.toLowerCase();
            const isNewLabel = !addedUuids.has(labelUuid) && labelLower.includes(event.target.value.toLowerCase());
    
            if (isNewLabel) {
                addedUuids.add(labelUuid);
            }
    
            return isNewLabel;
        })

        setFilterFiles(filteredUuids.map(label => label.video_uuid))
    };

    const handleLabelClick = (label) => {
        setFilterValue(label.label);
        setClickedLabel(true)
    };

    const addedLabels = new Set();
    const filteredLabels = labels.filter(label => {
        const labelLower = label.label.toLowerCase();
        const isNewLabel = !addedLabels.has(labelLower) && labelLower.includes(filterValue.toLowerCase());

        if (isNewLabel) {
            addedLabels.add(labelLower);
        }

        return isNewLabel;
    });

    const maxVisibleLabels = 10;
    const visibleLabels = filteredLabels.slice(0, maxVisibleLabels);

    const remainingCount = filteredLabels.length - visibleLabels.length;

    return (

        <div className="relative">

            <input
                type="text"
                placeholder="Enter filter"
                value={filterValue}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            />

            {
                filterValue != "" && !clickedLabel &&
                <>


                    <div className="bg-white border border-gray-300 mt-1 w-full h-auto">
                        {visibleLabels.length > 0 ? (
                            <ul>
                                {visibleLabels.map((label, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handleLabelClick(label)}
                                        className="cursor-pointer px-4 py-2 hover:bg-gray-200 capitalize"
                                    >
                                        {label.label}
                                    </li>
                                ))}
                                {remainingCount > 0 && (
                                    <li className="cursor-pointer px-4 py-2 text-gray-500">
                                        +{remainingCount} más
                                    </li>
                                )}
                            </ul>
                        ) : (
                            <p className="px-4 py-2">No results found</p>
                        )}
                    </div>

                </>
            }


        </div>
    );
};

export default Filterer;
