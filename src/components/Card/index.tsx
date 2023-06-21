import style from "./Card.module.css";
import { RiDeleteBin5Line } from "react-icons/ri";
import { AiOutlineEdit } from "react-icons/ai";
import { getHours, isAfter } from "date-fns";
import { useState } from "react";
import { ModalEdit } from "../ModalEdit";

interface ISchedule {
  name: string;
  phone: string;
  date: Date;
  id: string;
}

export const Card = ({ name, phone, date, id }: ISchedule) => {
  // verificar se ja passou o horario
  const isAfterDate = isAfter(new Date(date), new Date());

  // constante para edicao;
  const [openModal, setOpenModal] = useState<boolean>(false);

  // constante para formatar a data
  const dateFormatted = new Date(date);
  const hours = getHours(dateFormatted);

  // formatar o numero do telefone
  let phoneFormatted = phone.replace(/\D/g, "");
  phoneFormatted = phoneFormatted.replace(
    /(\d{2})(\d{5})(\d{4})/,
    "($1) $2-$3"
  );

  const handleChangeModal = () => {
    setOpenModal(!openModal);
  };

  return (
    <>
      <div className={style.background}>
        <div>
          <span className={`${!isAfterDate && style.disabled}`}>{hours}h</span>
          <p>
            {name} - {phoneFormatted}
          </p>
        </div>
        <div className={style.icons}>
          <AiOutlineEdit
            color="#5F68B1"
            size={20}
            onClick={() => isAfterDate && handleChangeModal()}
          />
          <RiDeleteBin5Line color="#EB2E2E" size={20} />
        </div>
      </div>
      <ModalEdit
        isOpen={openModal}
        handleChangeModal={handleChangeModal}
        hour={hours}
        id={id}
        name={name}
      ></ModalEdit>
    </>
  );
};
