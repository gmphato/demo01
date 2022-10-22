
import { DefaultLayout } from '../common/layouts/Default';

import Layout from '../common/components/layout/Layout';
import Button from '../common/components/Button';
import { useApi } from '@/hooks/useApi';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { ApiResultState } from '@/types/api';
import Color from './color';

type SelectedOption = {
  label: string,
  value: string
}

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
  const [{data, resultState, isLoading}, callSourceApi] = useApi();
  const [url, setUrl] = useState<string>()
  const [colors, setColors] = useState<string[]>([])
  const [fonts, setFonts] = useState<string[]>([])

  const options = [
    { label:"content", value:"content"},
    { label:"layout", value:"layout"},
    { label:"treeStructure", value:"treeStructure"},
    { label:"image", value:"image"},
    { label:"font", value:"font"},
    { label:"css", value:"css"},
    { label:"color", value:"color"},
    { label:"typography", value:"typography"},
  ]

  const [selectedOption, setSelectedOption] = useState<SelectedOption>({
    label: "",
    value: ""
  });

  useEffect(() => {
    if (selectedOption.value == "color" && 
    resultState == ApiResultState.Success) {
      const c = data as { colors: string[]}
      setColors(c.colors)
    } else if(selectedOption.value == "font" && 
    resultState == ApiResultState.Success) {
      console.log(data)
      const f = data as { fonts: string[]}
      setFonts(f.fonts)
    }
  },[data])

  const handleClick = () => {
    callSourceApi({
      url: `https://vercel-puppeteer-gmphto.vercel.app/api/${selectedOption.value}/${encodeURIComponent(url as string)}`
    })
  }

  const onChange = (v: string) => {
    setUrl(v)
  }

  return (
    <DefaultLayout title={'Index'}>
      <Layout.Container center>
        <div className={'pt-12 md:pt-20 text-center w-full'}>
          <h1 className={'font-bold text-white text-3xl md:text-5xl mb-8'}>
            Enter a URL
          </h1>
          <input
            type="text"
            name="price"
            id="price"
            className={"block w-full py-3 pl-12 pr-4 rounded-md font-bold text-gray-700 bg-gray-100"}
            placeholder="https://..."
            onChange={e => onChange(e.target.value)}
          >
          </input>

          <div>
            <pre>{JSON.stringify(selectedOption)}</pre>
            <Select
              options={options}
              value={selectedOption}
              onChange={v => setSelectedOption(v as SelectedOption)}
              className={{color: "black"}}
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

         {
          selectedOption.value == "color" && 
          resultState == ApiResultState.Success &&
          colors.map(c => {
            return <Color color={c}/>
          })
         }

         {
            selectedOption.value == "font" && 
            resultState == ApiResultState.Success &&
            fonts.map(f => {
              return <pre>{f}</pre>
            })
         }

          {isLoading && <pre>Is Loading....</pre>}

        </div>

      </Layout.Container>
    </DefaultLayout>
  );
}
