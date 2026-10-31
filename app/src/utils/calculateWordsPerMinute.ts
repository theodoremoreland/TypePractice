type Base =
    | {
          type: 'string';
          value: string;
      }
    | {
          type: 'number';
          value: number;
      };

const calculateWordsPerMinute = (base: Base, time: number) => {
    if (base.type === 'string') {
        return base.value.split(' ').length / (time / 1000 / 60);
    }

    if (base.value === 0) {
        return 0;
    }

    return base.value / (time / 1000 / 60);
};

export default calculateWordsPerMinute;
