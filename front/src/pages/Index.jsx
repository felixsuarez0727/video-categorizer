import { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import { fullUrl } from "../utils/constants";
import Filterer from "../components/Filterer";
import VideoBlock from "../components/VideoBlock";
import Modal from "../components/Modal";
import Loader from "../components/Loader";


function Index() {
  const { loading, result, error, fetchData } = useFetch("");
  const [files, setFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reloads, setReloads] = useState(0);
  const [filterFiles, setFilterFiles] = useState([]);
  const [filterValue, setFilterValue] = useState("");
  
  const incrementReloads = () => {
    setReloads(prevReloads => prevReloads + 1);
  };

  useEffect(() => {
    const fetchDataFromApi = async () => {
      try {
        await fetchData(`${fullUrl}/v1/bucket/files`, {
          method: 'GET',
          headers: {
            'Content-Type': 'Indexlication/json',
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
    const resultFiles = result.data.filter(label=> {
      return(filterFiles.includes(label));
    });
    
    if(filterValue != "") {
      setFiles(resultFiles);
    } else {
      setFiles(result.data);
    }

}, [result, filterFiles]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (!result && reloads == 0){
    return ( <Loader />)
  }

  return (
    <div>
      <Filterer reloads={reloads} filterFiles={filterFiles} setFilterFiles={setFilterFiles} filterValue={filterValue} setFilterValue={setFilterValue}/>

      <button
        onClick={handleOpenModal}
        className="absolute right-0 top-0 z-10 px-4 py-2 bg-blue-500 text-white rounded mt-2 mr-2"
      >
        File Upload
      </button>

      {!loading && files.length > 0 && (
        <div className='grid grid-cols-3 gap-1 '>
          {files.map((file, index) => (
            <VideoBlock key={index} index={index} file={file} />
          ))}
        </div>
      )}

      {error && <div>Error: {error}</div>}

      <Modal reload={incrementReloads} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}

export default Index;