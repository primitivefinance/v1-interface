import React from 'react'

import Button, { ButtonProps } from '../Button'

const IconButton: React.FC<ButtonProps> = (props) => {
    return (
        <Button
            {...props}
            round
        />
    )
}

export default IconButton