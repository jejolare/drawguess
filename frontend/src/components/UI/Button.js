export default function (props) {
    return (
        <button onClick={props.onClick} className={props.className}>{props.children}</button>
    );
}