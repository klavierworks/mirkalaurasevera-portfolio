import { getProjects, getSlides } from "@/utils/api";

export default function Custom404() {
  return <h1>404 - Page Not Found</h1>
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