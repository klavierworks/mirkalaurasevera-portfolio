import { getProjects, getSlides } from "@/utils/api";

export default function Custom500() {
  return <h1>500 - Server-side error occurred</h1>
}

export const getStaticProps = async () => {
  const slides = await getSlides()
    const projects = await getProjects()

  return {
    props: {
      projects,
      slides
    }
  };
};