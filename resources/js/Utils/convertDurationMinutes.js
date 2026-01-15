export const convertDurationMinutes = (durationMinutes) => {
    let formattedTime = "";

    if (durationMinutes < 60) {
        formattedTime = `${durationMinutes} ${
            durationMinutes > 2 ? " minutes" : " minute"
        }`;
    }

    const hours = Math.floor(durationMinutes / 60);
    const minutes =
        durationMinutes >= 60 ? durationMinutes % 60 : durationMinutes;

    formattedTime =
        hours || minutes
            ? `${
                  hours > 0
                      ? hours === 1
                          ? `${hours} hr`
                          : `${hours} hrs`
                      : ""
              }
            ${
                minutes > 0
                    ? minutes === 1
                        ? ` ${hours > 0 ? "and" : ""} ${minutes} min`
                        : ` ${hours > 0 ? "and" : ""} ${minutes} mins`
                    : ""
            }`
            : 0;

    return { hours, minutes, formattedTime };
};
