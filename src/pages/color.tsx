import {FC} from 'react';

type ColorProps = {
    color: string
}

const Color: FC<ColorProps> = ({color}) => {
    return (
        <div style={{background: color, height: 200, width: 200, marginBottom: 10, padding: 10}}>
            Card-{color}
        </div>
    )
}

export default Color;