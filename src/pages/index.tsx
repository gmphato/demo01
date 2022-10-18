import { useState } from 'react';

import { DefaultLayout } from '../common/layouts/Default';

import Layout from '../common/components/layout/Layout';
import Button from '../common/components/Button';

export default function Home() {
  const [isOpen, setOpen] = useState<boolean>(false);
  const toggleModal = () => setOpen(!isOpen);
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
            onClick={() => toggleModal()}
          />
        </Button.Group>
      </Layout.Container>
    </DefaultLayout>
  );
}
