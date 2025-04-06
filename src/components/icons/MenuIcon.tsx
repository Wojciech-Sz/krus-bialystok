export type MenuIconProps = {
  className: string;
  topLine: React.Ref<SVGLineElement>;
  middleLine: React.Ref<SVGLineElement>;
  bottomLine: React.Ref<SVGLineElement>;
};

const MenuIcon = ({
  topLine,
  middleLine,
  bottomLine,
  className,
}: MenuIconProps) => {
  return (
    <div className="focus:outline-none">
      <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line ref={topLine} x1="1.2" x2="22.8" y1="4" y2="4" />
        <line ref={middleLine} x1="1.2" x2="22.8" y1="12" y2="12" />
        <line ref={bottomLine} x1="1.2" x2="22.8" y1="20" y2="20" />
      </svg>
    </div>
  );
};

export default MenuIcon;
