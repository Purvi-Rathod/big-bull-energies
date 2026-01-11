"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MorphingText } from "./MorphingText";

export default function ExpertiseSection() {
  const [visibleTexts, setVisibleTexts] = useState([false, false, false]);

  const morphingWords = [
    "developers",
    "entrepreneurs",
    "innovators",
    "builders",
  ];

  useEffect(() => {
    // Animate text appearance one by one
    const timers = [
      setTimeout(() => setVisibleTexts([true, false, false]), 200),
      setTimeout(() => setVisibleTexts([true, true, false]), 600),
      setTimeout(() => setVisibleTexts([true, true, true]), 1000),
    ];

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <section className="relative w-full min-h-screen flex flex-col">
      {/* White Top Section - 30% */}
      <div className="relative w-full bg-white overflow-hidden py-8 md:py-12 lg:py-16">
        {/* Description Text in White Section */}
        <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-16">
          <p
            className="text-center text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-4xl"
            style={{
              color: "#042B19",
              fontFamily: "var(--font-font4), sans-serif",
            }}
          >
            Demand for secure, lower cost power is growing, and our customers
            count on us to meet their evolving energy needs with a flexible
            range of technologies, engineering expertise, and the highest safety
            standards.
          </p>
        </div>
      </div>

      {/* Light Green Bottom Section - Remaining 70% */}
      <div className="relative w-full bg-[#E8F5F0] overflow-hidden flex-1 py-8 md:py-12 lg:py-16">
        {/* SVG Background Pattern - Continuing from white section */}
        <div className="absolute inset-0 opacity-30" style={{ top: "-30vh" }}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1600 758"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <mask
              id="mask0_1_33461_bottom"
              style={{ maskType: "alpha" }}
              maskUnits="userSpaceOnUse"
              x="-1"
              y="0"
              width="1600"
              height="758"
            >
              <rect x="-1" width="1600" height="758" fill="#082A1B"></rect>
            </mask>
            <g mask="url(#mask0_1_33461_bottom)">
              <path
                d="M1908.26 1823.87C1318.47 1081.48 364.663 1054.59 -227.877 1816.93"
                stroke="url(#paint0_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M1918.4 1797.01C1322.33 1052.27 359.029 1025.91 -238.829 1789.99"
                stroke="url(#paint1_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M1928.57 1770.14C1326.21 1023.08 353.439 997.219 -249.687 1763.06"
                stroke="url(#paint2_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M1938.73 1743.25C1330.09 993.847 347.802 968.533 -260.644 1736.08"
                stroke="url(#paint3_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M1948.86 1716.38C1333.95 964.635 342.164 939.846 -271.575 1709.17"
                stroke="url(#paint4_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M1959.04 1689.52C1337.86 935.422 336.579 911.159 -282.479 1682.23"
                stroke="url(#paint5_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M1969.17 1662.65C1341.72 906.21 330.894 882.472 -293.432 1655.3"
                stroke="url(#paint6_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M1979.32 1635.76C1345.57 876.998 325.282 853.76 -304.363 1628.34"
                stroke="url(#paint7_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M1989.5 1608.89C1349.5 847.811 319.693 825.074 -315.271 1601.4"
                stroke="url(#paint8_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M1999.63 1582.03C1353.36 818.599 314.058 796.387 -326.225 1574.47"
                stroke="url(#paint9_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2009.79 1555.13C1357.24 789.362 308.421 767.7 -337.155 1547.51"
                stroke="url(#paint10_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2019.94 1528.29C1361.1 760.2 302.81 739.038 -348.086 1520.6"
                stroke="url(#paint11_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2030.1 1501.4C1364.99 730.962 297.204 710.326 -359.01 1493.64"
                stroke="url(#paint12_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2040.28 1474.53C1368.89 701.75 291.616 681.639 -369.917 1466.7"
                stroke="url(#paint13_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2050.41 1447.67C1372.75 672.538 285.928 652.953 -380.873 1439.77"
                stroke="url(#paint14_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2060.57 1420.78C1376.61 643.324 280.319 624.239 -391.801 1412.81"
                stroke="url(#paint15_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2070.75 1393.91C1380.51 614.112 274.732 595.552 -402.707 1385.87"
                stroke="url(#paint16_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2080.88 1367.04C1384.37 584.9 269.07 566.89 -413.662 1358.94"
                stroke="url(#paint17_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2091.03 1340.15C1388.25 555.662 263.456 538.177 -424.596 1331.98"
                stroke="url(#paint18_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2101.2 1313.31C1392.14 526.474 257.852 509.515 -435.518 1305.07"
                stroke="url(#paint19_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2111.35 1286.42C1396 497.262 252.218 480.828 -446.447 1278.1"
                stroke="url(#paint20_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2121.51 1259.53C1399.88 468.024 246.607 452.115 -457.376 1251.14"
                stroke="url(#paint21_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2131.67 1232.68C1403.76 438.836 240.995 423.453 -468.307 1224.23"
                stroke="url(#paint22_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2141.82 1205.79C1407.64 409.598 235.333 394.741 -479.237 1197.27"
                stroke="url(#paint23_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2151.96 1178.93C1411.48 380.411 229.701 366.053 -490.189 1170.34"
                stroke="url(#paint24_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2162.14 1152.06C1415.39 351.198 224.116 337.365 -501.092 1143.4"
                stroke="url(#paint25_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2172.29 1125.17C1419.27 321.959 218.503 308.652 -512.024 1116.44"
                stroke="url(#paint26_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2182.43 1098.3C1423.16 292.772 212.847 279.99 -522.975 1089.51"
                stroke="url(#paint27_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2192.61 1071.43C1427.04 263.584 207.265 251.302 -533.849 1062.6"
                stroke="url(#paint28_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2202.76 1044.54C1430.92 234.346 201.648 222.589 -544.786 1035.59"
                stroke="url(#paint29_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2212.9 1017.67C1434.78 205.133 196.015 193.902 -555.763 1008.68"
                stroke="url(#paint30_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2223.08 990.807C1438.69 175.92 190.384 165.214 -566.637 981.715"
                stroke="url(#paint31_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2233.21 963.94C1442.52 146.732 184.744 136.527 -577.57 954.806"
                stroke="url(#paint32_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2243.37 937.048C1446.41 117.494 179.114 107.839 -588.495 927.845"
                stroke="url(#paint33_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2253.56 910.182C1450.32 88.2812 173.532 79.1513 -599.396 900.91"
                stroke="url(#paint34_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2263.69 883.315C1454.18 59.0685 167.897 50.4638 -610.349 873.975"
                stroke="url(#paint35_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2273.85 856.423C1458.06 29.8301 162.287 21.751 -621.279 847.014"
                stroke="url(#paint36_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2284.03 829.556C1461.95 0.6419 156.68 -6.91177 -632.179 820.079"
                stroke="url(#paint37_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2294.17 802.689C1465.81 -28.5709 151.048 -35.5996 -643.131 793.143"
                stroke="url(#paint38_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2304.35 775.822C1469.72 -57.7843 145.433 -64.3127 -654.038 766.208"
                stroke="url(#paint39_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2314.48 748.955C1473.58 -86.9974 139.801 -93.0008 -664.989 739.272"
                stroke="url(#paint40_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2324.64 722.063C1477.44 -116.211 134.169 -121.689 -675.916 712.311"
                stroke="url(#paint41_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2334.82 695.195C1481.35 -145.424 128.586 -150.377 -686.818 685.375"
                stroke="url(#paint42_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
              <path
                d="M2344.96 668.329C1485.21 -174.637 122.954 -179.064 -697.769 658.441"
                stroke="url(#paint43_linear_1_33461_bottom)"
                strokeOpacity="0.85"
                strokeMiterlimit="10"
              ></path>
            </g>
            <defs>
              <linearGradient
                id="paint0_linear_1_33461_bottom"
                x1="1391.41"
                y1="2351.3"
                x2="290.062"
                y2="1272.03"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint1_linear_1_33461_bottom"
                x1="1396.15"
                y1="2329.94"
                x2="284.427"
                y2="1240.5"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint2_linear_1_33461_bottom"
                x1="1400.95"
                y1="2308.56"
                x2="278.862"
                y2="1208.96"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint3_linear_1_33461_bottom"
                x1="1405.72"
                y1="2287.15"
                x2="273.218"
                y2="1177.35"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint4_linear_1_33461_bottom"
                x1="1410.48"
                y1="2265.77"
                x2="267.585"
                y2="1145.78"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint5_linear_1_33461_bottom"
                x1="1415.3"
                y1="2244.38"
                x2="261.979"
                y2="1114.17"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint6_linear_1_33461_bottom"
                x1="1420.07"
                y1="2222.98"
                x2="256.314"
                y2="1082.54"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint7_linear_1_33461_bottom"
                x1="1424.88"
                y1="2201.55"
                x2="250.67"
                y2="1050.87"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint8_linear_1_33461_bottom"
                x1="1429.71"
                y1="2180.13"
                x2="245.045"
                y2="1019.21"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint9_linear_1_33461_bottom"
                x1="1434.51"
                y1="2158.71"
                x2="239.37"
                y2="987.522"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint10_linear_1_33461_bottom"
                x1="1439.34"
                y1="2137.25"
                x2="233.714"
                y2="955.794"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint11_linear_1_33461_bottom"
                x1="1444.17"
                y1="2115.84"
                x2="228.051"
                y2="924.099"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint12_linear_1_33461_bottom"
                x1="1449.01"
                y1="2094.37"
                x2="222.392"
                y2="892.335"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint13_linear_1_33461_bottom"
                x1="1453.89"
                y1="2072.92"
                x2="216.745"
                y2="860.578"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint14_linear_1_33461_bottom"
                x1="1458.71"
                y1="2051.47"
                x2="211.042"
                y2="828.802"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint15_linear_1_33461_bottom"
                x1="1463.58"
                y1="2029.98"
                x2="205.365"
                y2="796.985"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint16_linear_1_33461_bottom"
                x1="1468.47"
                y1="2008.51"
                x2="199.706"
                y2="765.177"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint17_linear_1_33461_bottom"
                x1="1473.31"
                y1="1987.03"
                x2="193.993"
                y2="733.352"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint18_linear_1_33461_bottom"
                x1="1478.19"
                y1="1965.53"
                x2="188.3"
                y2="701.486"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint19_linear_1_33461_bottom"
                x1="1483.08"
                y1="1944.06"
                x2="182.612"
                y2="669.654"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint20_linear_1_33461_bottom"
                x1="1487.97"
                y1="1922.54"
                x2="176.913"
                y2="637.757"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint21_linear_1_33461_bottom"
                x1="1492.87"
                y1="1901.02"
                x2="171.21"
                y2="605.843"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint22_linear_1_33461_bottom"
                x1="1497.77"
                y1="1879.54"
                x2="165.502"
                y2="573.964"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint23_linear_1_33461_bottom"
                x1="1502.68"
                y1="1858"
                x2="159.788"
                y2="542.017"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint24_linear_1_33461_bottom"
                x1="1507.57"
                y1="1836.48"
                x2="154.051"
                y2="510.084"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint25_linear_1_33461_bottom"
                x1="1512.52"
                y1="1814.96"
                x2="148.358"
                y2="478.135"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint26_linear_1_33461_bottom"
                x1="1517.44"
                y1="1793.41"
                x2="142.633"
                y2="446.145"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint27_linear_1_33461_bottom"
                x1="1522.35"
                y1="1771.87"
                x2="136.886"
                y2="414.168"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint28_linear_1_33461_bottom"
                x1="1527.32"
                y1="1750.33"
                x2="131.208"
                y2="382.2"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint29_linear_1_33461_bottom"
                x1="1532.26"
                y1="1728.75"
                x2="125.457"
                y2="350.132"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint30_linear_1_33461_bottom"
                x1="1537.18"
                y1="1707.21"
                x2="119.685"
                y2="318.126"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint31_linear_1_33461_bottom"
                x1="1542.17"
                y1="1685.64"
                x2="113.985"
                y2="286.078"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint32_linear_1_33461_bottom"
                x1="1547.1"
                y1="1664.08"
                x2="108.235"
                y2="254.057"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint33_linear_1_33461_bottom"
                x1="1552.06"
                y1="1642.49"
                x2="102.492"
                y2="221.972"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint34_linear_1_33461_bottom"
                x1="1557.06"
                y1="1620.92"
                x2="96.7689"
                y2="189.899"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint35_linear_1_33461_bottom"
                x1="1562"
                y1="1599.35"
                x2="90.99"
                y2="157.814"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint36_linear_1_33461_bottom"
                x1="1566.98"
                y1="1577.75"
                x2="85.2318"
                y2="125.692"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint37_linear_1_33461_bottom"
                x1="1571.99"
                y1="1556.16"
                x2="79.498"
                y2="93.5814"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint38_linear_1_33461_bottom"
                x1="1576.95"
                y1="1534.57"
                x2="73.711"
                y2="61.4586"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint39_linear_1_33461_bottom"
                x1="1581.96"
                y1="1512.98"
                x2="67.9641"
                y2="29.3237"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint40_linear_1_33461_bottom"
                x1="1586.93"
                y1="1491.38"
                x2="62.1706"
                y2="-2.82325"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint41_linear_1_33461_bottom"
                x1="1591.93"
                y1="1469.76"
                x2="56.3983"
                y2="-35.0067"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint42_linear_1_33461_bottom"
                x1="1596.96"
                y1="1448.15"
                x2="50.6477"
                y2="-67.1772"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
              <linearGradient
                id="paint43_linear_1_33461_bottom"
                x1="1601.94"
                y1="1426.54"
                x2="44.8446"
                y2="-99.3578"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.668984" stopColor="#205A40"></stop>
                <stop offset="1" stopColor="#CEE4DA" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Content Grid - Text Left, Image Right */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 h-full px-4 sm:px-6 md:px-8 lg:px-16 py-4 md:py-6 lg:py-8">
          {/* Left Side - Text Content */}
          <div className="flex flex-col justify-center order-2 lg:order-1">
            <p className="text-gray-600 text-xs sm:text-sm font-medium mb-2 sm:mb-4 uppercase tracking-wide">
              EXPERTISE
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-2 sm:mb-4 leading-[1.05]"
              style={{ color: "#042B19" }}
            >
              <span
                style={{
                  fontFamily: "'Font1', sans-serif",
                  fontWeight: "normal",
                  display: "inline-block",
                  opacity: visibleTexts[0] ? 1 : 0,
                  transform: visibleTexts[0]
                    ? "translateY(0)"
                    : "translateY(20px)",
                  transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
                  lineHeight: "1.05",
                }}
              >
                We are
              </span>
              <div
                style={{
                  fontFamily: "'Font3', sans-serif",
                  fontWeight: "bold",
                  opacity: visibleTexts[1] ? 1 : 0,
                  transform: visibleTexts[1]
                    ? "translateY(0)"
                    : "translateY(20px)",
                  transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
                  minHeight: "1.05em",
                  position: "relative",
                  lineHeight: "1.05",
                  marginTop: "0.05em",
                  marginBottom: "0.05em",
                }}
              >
                <MorphingText
                  texts={morphingWords}
                  className="h-auto text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05]"
                  style={{
                    fontFamily: "'Font3', sans-serif",
                    color: "#042B19",
                    filter: "none",
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: "'Font1', sans-serif",
                  fontWeight: "normal",
                  display: "inline-block",
                  opacity: visibleTexts[2] ? 1 : 0,
                  transform: visibleTexts[2]
                    ? "translateY(0)"
                    : "translateY(20px)",
                  transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
                  lineHeight: "1.05",
                }}
              >
                at heart.
              </span>
            </h2>
            <p className="text-gray-600 text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl max-w-lg leading-relaxed mt-2 sm:mt-4">
              With the know-how and experience to rise to any challenge.
            </p>
          </div>

          {/* Right Side - Image */}
          <div className="relative w-full h-full min-h-[300px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[500px] order-1 lg:order-2">
            <Image
              src="/rightside.webp"
              alt="Industrial energy facility"
              fill
              className="object-cover"
              priority
            />
            {/* Yellow Button Overlay - Bottom Left Corner */}
            <div className="absolute bottom-0 left-0 p-3 sm:p-4 md:p-5 lg:p-6">
              <button
                className="bg-[#ffcf0B] text-gray-900 font-bold px-4 sm:px-6 py-3 sm:py-4 transition hover:opacity-90 text-xs sm:text-sm uppercase tracking-wide whitespace-nowrap"
                style={{ borderRadius: "0" }}
              >
                SEE HOW WE WORK
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
