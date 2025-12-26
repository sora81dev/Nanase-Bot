import { ButtonBuilder, ButtonStyle } from "discord.js"

type Props = {
    label: string;
    customId: string;
    style?: ButtonStyle;
}

const createButton = (props: Props) => {
    return new ButtonBuilder()
        .setLabel(props.label)
        .setCustomId(props.customId)
        .setStyle(props.style ?? ButtonStyle.Primary);
}

export { createButton };