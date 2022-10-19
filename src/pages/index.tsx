
import { DefaultLayout } from '../common/layouts/Default';

import Layout from '../common/components/layout/Layout';
import Button from '../common/components/Button';
import { useApi } from '@/hooks/useApi';
import { useEffect } from 'react';

export default function Home() {
  const [{ data }, callSourceApi] = useApi();

  useEffect(() => {
    console.log("res", data)
  },[data])

  const url = "https://vercel.com/";

  const handleClick = () => {
    callSourceApi({
      url: `https://vercel-puppeteer-gmphto.vercel.app/api/content/${encodeURIComponent(url)}`
    })
  }

  return (
    <DefaultLayout title={'Index'}>
      <Layout.Container center>
        <div className={'pt-12 md:pt-20 text-center'}>
          <h1 className={'font-bold text-white text-3xl md:text-5xl mb-8'}>
          Enter a URL
          </h1>
          <input 
          type="text" 
          name="price" 
          id="price" className={"block w-full py-3 pl-12 pr-4 rounded-md font-bold text-gray-700 bg-gray-100"} 
          placeholder="https://...">
            </input>

        </div>
        <Button.Group className="flex mt-12 space-y-5 sm:space-y-0 sm:space-x-5">
          <Button.Primary
            title={`Extract This`}
            size="xl"
            className="!px-6"
            onClick={() => handleClick()}
          />
        </Button.Group>
      </Layout.Container>
    </DefaultLayout>
  );
}
