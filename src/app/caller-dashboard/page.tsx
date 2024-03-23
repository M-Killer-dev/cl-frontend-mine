import CallerDashboard from "@/components/CallerDashboard";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import axios from "axios";

const getRecords = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASEURL}/records`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const Page = async () => {
  const records = await getRecords();

  return (
    <>
      <Header theme="dark" hideActionButton={true} isUserLogged={true} />
      <CallerDashboard records={records} />
      <Footer />
    </>
  );
};

export default Page;
