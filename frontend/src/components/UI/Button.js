export default function (props) {
    return (
        <button onClick={props.onClick}>{props.children}</button>
    );
}