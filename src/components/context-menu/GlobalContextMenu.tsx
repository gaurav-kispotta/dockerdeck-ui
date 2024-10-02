import {
    Menu,
    Item,
    Separator,
    Submenu,
    ItemParams,
} from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

const MENU_ID = "menu-id";

export default function GlobalContextMenu() {
    function handleItemClick({ event, props, triggerEvent, data }: ItemParams) {
        console.log(event, props, triggerEvent, data);
    }

    return (
        <Menu id={MENU_ID}>
            <Item onClick={handleItemClick}>
                Add Network
            </Item>
            <Item onClick={handleItemClick}>
                Add Service
            </Item>
            <Separator />
            <Item disabled>Run</Item>
            <Separator />
            <Submenu label="Build">
                <Item onClick={handleItemClick}>
                    Docker Compose
                </Item>
                <Item onClick={handleItemClick}>Docker Build</Item>
            </Submenu>
        </Menu>
    )
}