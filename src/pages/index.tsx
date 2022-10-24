import { useState } from 'react';
import Layout from '../common/components/layout/Layout';
import Button from '../common/components/Button';
import { useApi } from '@/hooks/useApi';
import { DefaultLayout } from '../common/layouts/Default';

// function RGBToHex(r,g,b) {
//   r = r.toString(16);
//   g = g.toString(16);
//   b = b.toString(16);

//   if (r.length == 1)
//     r = "0" + r;
//   if (g.length == 1)
//     g = "0" + g;
//   if (b.length == 1)
//     b = "0" + b;

//   return "#" + r + g + b;
// }

export default function Home() {
  const [{ data: structureResponse, isLoading: structureIsLoading }, getStructureApi] = useApi();
  const [{ data: contentResponse, isLoading: contentIsLoading }, getContentApi] = useApi();
  const [{ data: colorsResponse, isLoading: colorsIsLoading }, getColorsApi] = useApi();

  const [url, setUrl] = useState<string>()
  const encodedUrl = encodeURIComponent(url as string)

  const handleClick = () => {
    getColorsApi({
      url: `https://vercel-puppeteer-gmphto.vercel.app/api/color/${encodedUrl}`
    })

    getContentApi({
      url: `https://vercel-puppeteer-gmphto.vercel.app/api/content/${encodedUrl}`
    })

    getStructureApi({
      url: `https://vercel-puppeteer-gmphto.vercel.app/api/treeStructure/${encodedUrl}`
    })
  }

  const handleChange = (url: string) => setUrl(url)

  return (
    <DefaultLayout title={'Index'}>
      <Layout.Container center>
        <div className={'pt-12 md:pt-20 text-center w-full'}>
          <h1 className={'font-bold text-white text-3xl md:text-5xl mb-8'}>
            Enter a URL
          </h1>

          <div className="mb-3 pt-0">
            <input type="text" placeholder="Placeholder" className="px-3 py-3 placeholder-slate-300 text-slate-600 relative bg-white bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full"
              onChange={e => handleChange(e.target.value)}
            />
          </div>

          <Button.Group className="flex mt-12 space-y-5 sm:space-y-0 sm:space-x-5">
            <Button.Primary
              title={`Processs URL`}
              size="xl"
              className="px-3 py-2 ml-2 font-medium rounded-lg bg-types-150 hover:text-white hover:bg-types-200 animate"
              onClick={() => handleClick()}
            />
          </Button.Group>

          <br></br>

          {/* { (colorsResponse as any).data &&
            (colorsResponse as any).colors.map(c => {
              return <Color color={c} />
            })
          }

          {
            selectedOption.value == "font" &&
            resultState == ApiResultState.Success &&
            fonts.map(f => {
              return <pre>{f}</pre>
            })
          }  */}

          {colorsIsLoading && <pre>Color is loading....</pre>}
          <pre>{JSON.stringify(colorsResponse)}</pre>

          {contentIsLoading && <pre>Content is loading....</pre>}
          <pre>{JSON.stringify(contentResponse)}</pre>

          {structureIsLoading && <pre>Structure is loading....</pre>}
          <pre>{JSON.stringify(structureResponse)}</pre>

        </div>

      </Layout.Container>
    </DefaultLayout>
  );
}
