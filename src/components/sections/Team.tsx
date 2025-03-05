import Image from "next/image";
import React from "react";

import { team } from "@/constants";

const Team = () => {
  return (
    <section className="section section-pt-big section-container">
      <div id="team" className="absolute -top-16" />
      <h2 className="section-title">Nasi Pracownicy</h2>
      <div className="section-gap flex w-full flex-wrap items-center justify-center">
        {team.map((member) => (
          <div
            key={member.id}
            className="flex w-40 flex-col rounded-md px-2 transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-lg"
          >
            <Image
              src={member.img}
              alt={member.name}
              width={200}
              height={200}
              className="aspect-square rounded-full bg-green-700 object-cover"
            />
            <h3 className="text-center text-2xl font-bold">
              {member.name}
            </h3>
            <p className="text-center text-lg">
              {member.position}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
export default Team;
